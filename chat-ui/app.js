/**
 * Chat engine: multi-chat state management, segment advancement, streaming, hotkeys.
 *
 * Interaction model:
 *   - Multiple chat cards stacked vertically
 *   - Ctrl+Shift+N advances the active (expanded) chat
 *   - When a chat has spawnOnComplete, finishing it auto-creates the listed chats
 *   - "+ New Chat" button is always visible (decorative)
 *   - Stack/Split toggle controls layout mode
 */
(function() {
  'use strict';

  var C = window.ChatComponents;
  var B = window.ChatBridge;
  var config = window.ChatConfig;

  // ── App State ──
  var appState = {
    viewMode: 'stack',         // 'stack' or 'split'
    activeChatId: null,        // currently expanded chat id
    visibleChatIds: [],        // ordered list of created chat ids
    nextChatIndex: 0,          // index into config.chats for next chat to create
    chatStates: {}             // per-chat state keyed by chat id
  };

  // DOM references
  var chatStackEl = document.getElementById('chat-stack');
  var newChatBtn = document.getElementById('new-chat-btn');
  var viewToggleEl = document.getElementById('view-toggle');

  var fastMode = false;

  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, fastMode ? 0 : ms); });
  }

  // ── Type user message into the input field, then send as bubble ──
  async function typeAndSendUser(chatId, text, messagesEl) {
    var chatCard = messagesEl.closest('.chat-card');
    var input = chatCard ? chatCard.querySelector('.chat-input') : null;
    var sendBtn = chatCard ? chatCard.querySelector('.chat-send-btn') : null;

    if (input && !fastMode) {
      input.value = '';
      input.style.height = 'auto';
      var chars = text.split('');
      for (var i = 0; i < chars.length; i++) {
        input.value += chars[i];
        if (i === 0 && sendBtn) sendBtn.classList.add('active');
        // Auto-resize textarea
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        await new Promise(function(r) { setTimeout(r, 35 + Math.floor(Math.random() * 25)); });
      }
      await sleep(300);
      // Flash send button
      if (sendBtn) sendBtn.classList.add('sending');
      await sleep(150);
      input.value = '';
      input.style.height = 'auto';
      if (sendBtn) { sendBtn.classList.remove('sending'); sendBtn.classList.remove('active'); }
    }

    // Add the bubble instantly (text already "sent")
    var userEl = C.userMessage(text, { typing: false });
    append(messagesEl, userEl);
  }

  // ── Agent ready signal (resolved when parent signals .left-pane rendered) ──
  var agentReadyResolve = null;
  var agentReadyPromise = new Promise(function(r) { agentReadyResolve = r; });

  B.on('agentReady', function() {
    if (agentReadyResolve) {
      agentReadyResolve();
      agentReadyResolve = null;
    }
  });

  // ── Execute action via bridge ──
  function executeAction(action) {
    if (!action) return;
    if (action.type === 'openAgent') {
      // Reset promise so statusLines can await it
      agentReadyPromise = new Promise(function(r) { agentReadyResolve = r; });
    }
    if (action.type === 'spawnChat') {
      spawnSingleChat(action.chatId);
      return;
    }
    B.send(action.type, action);
  }

  // ── Scroll a chat's messages area to bottom ──
  function scrollToBottom(messagesEl) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Append element to a specific messages container and scroll ──
  function append(messagesEl, el) {
    messagesEl.appendChild(el);
    scrollToBottom(messagesEl);
  }

  // ── Render a complete assistant message ──
  async function renderAssistantMessage(messagesEl, msg, stream, chatId) {
    if (msg.text) {
      var textEl = C.assistantText(msg.text, { stream: stream && !fastMode, streamDelay: 40 });
      append(messagesEl, textEl);
      if (textEl._streamPromise) await textEl._streamPromise;
    }

    if (msg.tasks && msg.tasks.length) {
      msg.tasks.forEach(function(t) {
        append(messagesEl, C.taskCard(t));
      });
      scrollToBottom(messagesEl);
    }

    if (msg.chart) {
      append(messagesEl, C.barChart(msg.chart));
      scrollToBottom(messagesEl);
    }

    if (msg.statusLines) {
      for (var i = 0; i < msg.statusLines.length; i++) {
        var sl = msg.statusLines[i];
        append(messagesEl, C.statusLine(sl.icon, sl.text, sl.color));
        if (chatId && appState.chatStates[chatId]) {
          appState.chatStates[chatId].lastStatusText = sl.text;
          updatePreview(chatId);
        }
        await sleep(400);
      }
    }

    if (msg.checklist) {
      for (var i = 0; i < msg.checklist.length; i++) {
        var ci = msg.checklist[i];
        append(messagesEl, C.checklistItem(ci));
        if (chatId && appState.chatStates[chatId]) {
          appState.chatStates[chatId].lastStatusText = ci.label;
          updatePreview(chatId);
        }
        await sleep(500 + Math.random() * 400);
      }
    }

    if (msg.followUp) {
      await sleep(300);
      append(messagesEl, C.followUp(msg.followUp));
    }

    if (msg.action) {
      await sleep(300);
      executeAction(msg.action);
    }
  }

  // ── Show typing indicator, then remove ──
  async function showTypingThen(messagesEl, fn) {
    var indicator = C.typingIndicator();
    append(messagesEl, indicator);
    await sleep(800);
    indicator.remove();
    await fn();
  }

  // ── Get the actual segment from config for a chat's current position ──
  function getCurrentSegment(chatId) {
    var chatState = appState.chatStates[chatId];
    var chatDef = getChatDef(chatId);
    if (!chatDef || chatState.segmentIndex >= chatDef.segments.length) return null;
    var globalIndex = chatDef.segments[chatState.segmentIndex];
    return config.segments[globalIndex];
  }

  function getChatDef(chatId) {
    for (var i = 0; i < config.chats.length; i++) {
      if (config.chats[i].id === chatId) return config.chats[i];
    }
    return null;
  }

  // ── Advance: main entry point (scoped to active chat) ──
  async function advance() {
    var chatId = appState.activeChatId;
    if (!chatId) return;

    var chatState = appState.chatStates[chatId];
    if (!chatState || chatState.isAnimating) return;

    var chatDef = getChatDef(chatId);
    if (!chatDef || chatState.segmentIndex >= chatDef.segments.length) {
      console.log('[ChatApp] Chat ' + chatId + ' is complete');
      return;
    }

    chatState.isAnimating = true;
    updateStatusLight(chatId);
    updatePreview(chatId);

    try {
      var seg = getCurrentSegment(chatId);
      if (!seg) { chatState.isAnimating = false; updateStatusLight(chatId); updatePreview(chatId); return; }

      var messagesEl = chatState.messagesEl;

      if (seg.type === 'narrate' || seg.type === 'question-answer') {
        await advanceSimple(chatId, seg, messagesEl);
      } else if (seg.type === 'plan-approve-build') {
        await advancePlanApprove(chatId, seg, messagesEl);
      }
    } finally {
      chatState.isAnimating = false;
      updateStatusLight(chatId);
      updatePreview(chatId);
    }

    checkChatCompletion(chatId);
  }

  // ── Simple segment: show messages one by one ──
  async function advanceSimple(chatId, seg, messagesEl) {
    var chatState = appState.chatStates[chatId];

    if (chatState.messageIndex >= seg.messages.length) {
      chatState.segmentIndex++;
      chatState.messageIndex = 0;
      chatState.phase = 'idle';
      console.log('[ChatApp] Chat ' + chatId + ' segment complete, moving to local ' + chatState.segmentIndex);
      return;
    }

    var msg = seg.messages[chatState.messageIndex];

    if (msg.role === 'user') {
      await typeAndSendUser(chatId, msg.text, messagesEl);
      if (msg.action) executeAction(msg.action);
      chatState.messageIndex++;
      await sleep(200);

      if (chatState.messageIndex < seg.messages.length && seg.messages[chatState.messageIndex].role === 'assistant') {
        await showTypingThen(messagesEl, async function() {
          var assistMsg = seg.messages[chatState.messageIndex];
          await renderAssistantMessage(messagesEl, assistMsg, true, chatId);
          chatState.messageIndex++;
        });
      }
    } else {
      await showTypingThen(messagesEl, async function() {
        await renderAssistantMessage(messagesEl, msg, true, chatId);
        chatState.messageIndex++;
      });
    }

    if (chatState.messageIndex >= seg.messages.length) {
      chatState.segmentIndex++;
      chatState.messageIndex = 0;
      chatState.phase = 'idle';
    }
  }

  // ── Plan-approve-build segment ──
  async function advancePlanApprove(chatId, seg, messagesEl) {
    var chatState = appState.chatStates[chatId];

    if (chatState.phase === 'idle' || chatState.phase === 'messages') {
      if (chatState.messageIndex < seg.messages.length) {
        var msg = seg.messages[chatState.messageIndex];
        if (msg.role === 'user') {
          await typeAndSendUser(chatId, msg.text, messagesEl);
          if (msg.action) executeAction(msg.action);
        }
        chatState.messageIndex++;
      }

      await showTypingThen(messagesEl, async function() {
        var planEl = C.planBlock(seg.plan);
        append(messagesEl, planEl);

        var btn = planEl.querySelector('[data-approve]');
        if (btn) {
          btn.addEventListener('click', function() {
            if (!btn.classList.contains('approved')) {
              approveAndBuild(chatId, seg, messagesEl, btn);
            }
          });
        }
      });

      chatState.phase = 'plan-shown';
      return;
    }

    if (chatState.phase === 'plan-shown') {
      var btn = messagesEl.querySelector('.plan-approve-btn:not(.approved)');
      if (btn) {
        await approveAndBuild(chatId, seg, messagesEl, btn);
      }
      return;
    }

    if (chatState.phase === 'build-done') {
      chatState.segmentIndex++;
      chatState.messageIndex = 0;
      chatState.phase = 'idle';
      return;
    }
  }

  async function approveAndBuild(chatId, seg, messagesEl, btn) {
    var chatState = appState.chatStates[chatId];

    btn.classList.add('approved');
    btn.textContent = 'Approved';
    chatState.phase = 'building';

    if (seg.plan && seg.plan.approveAction) {
      executeAction(seg.plan.approveAction);
    }

    await sleep(400);

    var build = seg.build;

    for (var i = 0; i < build.statusLines.length; i++) {
      var sl = build.statusLines[i];
      append(messagesEl, C.statusLine(sl.icon, sl.text, sl.color));
      chatState.lastStatusText = sl.text;
      updatePreview(chatId);

      if (sl.waitForAgent) {
        await agentReadyPromise;
        await sleep(300);
      } else if (sl.delay) {
        await sleep(sl.delay);
      } else {
        await sleep(400 + Math.random() * 600);
      }

      if (sl.action) {
        executeAction(sl.action);
        await sleep(300);
      }

      if (build.flowSteps && build.flowSteps.length) {
        var stepIdx = Math.floor(i * build.flowSteps.length / build.statusLines.length);
        if (stepIdx < build.flowSteps.length && (i === 0 || Math.floor((i-1) * build.flowSteps.length / build.statusLines.length) < stepIdx)) {
          executeAction({ type: 'revealFlowStep', step: build.flowSteps[stepIdx] });
        }
      }
    }

    await sleep(300);

    if (build.completionText) {
      var completionEl = C.assistantText(build.completionText, { stream: !fastMode, streamDelay: 30 });
      append(messagesEl, completionEl);
      if (completionEl._streamPromise) await completionEl._streamPromise;
    }

    if (build.chart) {
      append(messagesEl, C.barChart(build.chart));
      scrollToBottom(messagesEl);
    }

    if (build.tasks && build.tasks.length) {
      build.tasks.forEach(function(t) { append(messagesEl, C.taskCard(t)); });
      scrollToBottom(messagesEl);
    }

    if (build.followUp) {
      await sleep(300);
      append(messagesEl, C.followUp(build.followUp));
    }

    chatState.segmentIndex++;
    chatState.messageIndex = 0;
    chatState.phase = 'idle';
    chatState.lastStatusText = '';

    checkChatCompletion(chatId);
  }

  // ── Check if a chat has completed all its segments ──
  function checkChatCompletion(chatId) {
    var chatState = appState.chatStates[chatId];
    var chatDef = getChatDef(chatId);
    if (!chatDef) return;

    if (chatState.segmentIndex >= chatDef.segments.length) {
      chatState.completed = true;
      updateStatusLight(chatId);
      updatePreview(chatId);
    }
  }

  // ── Auto-play a chat's opener segment (assistant-first narrate) ──
  async function autoPlayOpener(chatId, animate) {
    var chatState = appState.chatStates[chatId];
    var seg = getCurrentSegment(chatId);
    if (!seg || seg.type !== 'narrate') return;

    chatState.isAnimating = true;
    updateStatusLight(chatId);
    updatePreview(chatId);
    var messagesEl = chatState.messagesEl;

    for (var j = 0; j < seg.messages.length; j++) {
      var currentMsg = seg.messages[j];
      if (currentMsg.role === 'assistant') {
        if (animate) {
          await showTypingThen(messagesEl, (function(m, el, cid) {
            return async function() {
              await renderAssistantMessage(el, m, true, cid);
            };
          })(currentMsg, messagesEl, chatId));
        } else {
          // Instant (no typing indicator or streaming)
          await renderAssistantMessage(messagesEl, currentMsg, false, chatId);
        }
      }
    }

    chatState.segmentIndex++;
    chatState.messageIndex = 0;
    chatState.phase = 'idle';
    chatState.isAnimating = false;
    updateStatusLight(chatId);
    updatePreview(chatId);
  }

  // ── Spawn a single chat by id (used by spawnChat action) ──
  async function spawnSingleChat(chatId) {
    if (appState.chatStates[chatId]) return; // already exists

    createChatCard(chatId);

    // Track nextChatIndex past this chat
    for (var i = 0; i < config.chats.length; i++) {
      if (config.chats[i].id === chatId) {
        appState.nextChatIndex = Math.max(appState.nextChatIndex, i + 1);
        break;
      }
    }

    // Expand to the new chat and animate its opener
    appState.activeChatId = chatId;
    applyLayout();

    await autoPlayOpener(chatId, true);
  }

  // ── Spawn multiple chats at once ──
  async function spawnChats(chatIds) {
    var firstNewId = null;
    var newIds = [];

    chatIds.forEach(function(id) {
      // Skip if already created
      if (appState.chatStates[id]) return;

      // Find and advance nextChatIndex past this chat
      for (var i = appState.nextChatIndex; i < config.chats.length; i++) {
        if (config.chats[i].id === id) {
          appState.nextChatIndex = Math.max(appState.nextChatIndex, i + 1);
          break;
        }
      }

      createChatCard(id);
      newIds.push(id);
      if (!firstNewId) firstNewId = id;
    });

    // Expand the first new chat, collapse the rest
    if (firstNewId) {
      appState.activeChatId = firstNewId;
      appState.viewMode = 'stack';
      updateViewToggle();
      applyLayout();
    }

    // Auto-play opener segment for the active chat (animated),
    // and silently populate the rest
    for (var i = 0; i < newIds.length; i++) {
      if (newIds[i] === firstNewId) {
        await autoPlayOpener(newIds[i], true);
      } else {
        await autoPlayOpener(newIds[i], false);
      }
    }

    console.log('[ChatApp] Spawned chats: ' + chatIds.join(', '));
  }

  // ── Status light management ──
  // States: 'waiting' (amber pulse), 'running' (green pulse), 'done' (solid green), 'error' (red)
  function updateStatusLight(chatId) {
    var card = document.getElementById(chatId);
    if (!card) return;
    var light = card.querySelector('.chat-status-light');
    if (!light) return;

    var chatState = appState.chatStates[chatId];
    if (!chatState) return;

    light.className = 'chat-status-light';

    if (chatState.completed) {
      light.classList.add('done');
    } else if (chatState.failed) {
      light.classList.add('error');
    } else if (chatState.phase === 'plan-shown') {
      light.classList.add('needs-input');
    } else if (chatState.isAnimating || chatState.phase === 'building') {
      light.classList.add('running');
    } else {
      light.classList.add('waiting');
    }
  }

  // ── Preview text management ──
  function updatePreview(chatId) {
    var chatState = appState.chatStates[chatId];
    var chatDef = getChatDef(chatId);
    if (!chatState || !chatDef) return;

    var card = document.getElementById(chatId);
    if (!card) return;
    var previewEl = card.querySelector('.chat-card-preview');
    if (!previewEl) return;

    // Dynamic: use last status line text if available
    if (chatState.lastStatusText) {
      previewEl.textContent = '— ' + chatState.lastStatusText;
      return;
    }

    // Static fallback from previews map — look at last *completed* segment
    if (!chatDef.previews) return;
    var text = chatDef.preview || '';
    for (var i = chatState.segmentIndex - 1; i >= 0; i--) {
      if (chatDef.previews[i] !== undefined) {
        text = chatDef.previews[i];
        break;
      }
    }
    previewEl.textContent = text;
  }

  // ── Create a chat card ──
  function createChatCard(chatId) {
    var chatDef = getChatDef(chatId);
    if (!chatDef) return;

    // Create per-chat state
    appState.chatStates[chatId] = {
      segmentIndex: 0,
      messageIndex: 0,
      phase: 'idle',
      isAnimating: false,
      completed: false,
      failed: false,
      lastStatusText: '',
      messagesEl: null
    };

    // Build card DOM
    var card = document.createElement('div');
    card.className = 'chat-card expanded';
    card.id = chatId;

    // Header
    var header = document.createElement('div');
    header.className = 'chat-card-header';
    header.innerHTML =
      '<div class="chat-header-left">' +
        '<div class="chat-status-light waiting" data-light="true"></div>' +
        '<span class="chat-card-name">' + C.esc(chatDef.name) + '</span>' +
        '<span class="chat-card-preview">' + C.esc(chatDef.preview) + '</span>' +
      '</div>' +
      '<div class="chat-header-actions">' +
        '<button class="chat-header-btn expand-icon" title="Maximize">&#x2922;</button>' +
        '<button class="chat-header-btn collapse-icon" title="Collapse">&mdash;</button>' +
      '</div>';

    header.addEventListener('click', function(e) {
      if (e.target.closest('.chat-header-btn')) return;
      expandChatCard(chatId);
    });

    // Maximize button
    header.querySelector('.expand-icon').addEventListener('click', function() {
      appState.viewMode = 'stack';
      updateViewToggle();
      expandChatCard(chatId);
    });

    // Collapse button
    header.querySelector('.collapse-icon').addEventListener('click', function() {
      if (appState.activeChatId === chatId && appState.viewMode === 'stack') {
        // Already active — do nothing
        return;
      }
      expandChatCard(chatId);
    });

    card.appendChild(header);

    // Body (messages area)
    var body = document.createElement('div');
    body.className = 'chat-card-body';
    card.appendChild(body);

    // Input area
    var inputArea = document.createElement('div');
    inputArea.className = 'chat-input-area';
    inputArea.innerHTML =
      '<div class="chat-input-row">' +
        '<textarea class="chat-input" placeholder="Describe what you\'d like to build..." rows="1" disabled></textarea>' +
        '<button class="chat-send-btn">&#8593;</button>' +
      '</div>';
    card.appendChild(inputArea);

    // Store messagesEl reference
    appState.chatStates[chatId].messagesEl = body;

    // Add to stack
    chatStackEl.appendChild(card);
    appState.visibleChatIds.push(chatId);

    // Set up pill click handler for this card
    body.addEventListener('click', function(e) {
      var pillEl = e.target.closest('.pill');
      if (pillEl && pillEl.dataset.action) {
        try {
          var action = JSON.parse(pillEl.dataset.action);
          executeAction(action);
        } catch (err) {
          console.log('[ChatApp] Invalid pill action:', err);
        }
      }
    });

    return card;
  }

  // ── Expand a specific chat card (collapse others in stack mode) ──
  function expandChatCard(chatId) {
    appState.activeChatId = chatId;
    applyLayout();
  }

  // ── Apply layout based on viewMode ──
  function applyLayout() {
    var cards = chatStackEl.querySelectorAll('.chat-card');
    cards.forEach(function(card) {
      card.classList.remove('expanded', 'collapsed', 'equal');
      if (appState.viewMode === 'split') {
        card.classList.add('equal');
      } else {
        if (card.id === appState.activeChatId) {
          card.classList.add('expanded');
        } else {
          card.classList.add('collapsed');
        }
      }
    });

    // Show view toggle when more than 1 chat exists
    if (appState.visibleChatIds.length > 1) {
      viewToggleEl.style.display = '';
    }
  }

  // ── View toggle ──
  function setViewMode(mode) {
    appState.viewMode = mode;
    updateViewToggle();
    applyLayout();
  }

  function updateViewToggle() {
    var btns = viewToggleEl.querySelectorAll('.view-toggle-btn');
    btns.forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.mode === appState.viewMode);
    });
  }

  // Wire up view toggle buttons
  viewToggleEl.addEventListener('click', function(e) {
    var btn = e.target.closest('.view-toggle-btn');
    if (btn && btn.dataset.mode) {
      setViewMode(btn.dataset.mode);
    }
  });

  // ── Create next chat ──
  function createNewChat() {
    if (appState.nextChatIndex >= config.chats.length) return;

    var chatDef = config.chats[appState.nextChatIndex];
    appState.nextChatIndex++;

    createChatCard(chatDef.id);
    appState.activeChatId = chatDef.id;
    appState.viewMode = 'stack';
    updateViewToggle();
    applyLayout();

    console.log('[ChatApp] Created chat: ' + chatDef.name);
  }

  // Wire up new chat button
  newChatBtn.addEventListener('click', createNewChat);

  // ── Reset (active chat only) ──
  function reset() {
    var chatId = appState.activeChatId;
    if (!chatId) return;

    var chatState = appState.chatStates[chatId];
    if (!chatState) return;

    chatState.segmentIndex = 0;
    chatState.messageIndex = 0;
    chatState.phase = 'idle';
    chatState.isAnimating = false;
    chatState.completed = false;
    chatState.messagesEl.innerHTML = '';
    updateStatusLight(chatId);
    updatePreview(chatId);

    B.send('reset', {});
    console.log('[ChatApp] Reset chat: ' + chatId);
  }

  // ── Hotkeys ──
  document.addEventListener('keydown', function(e) {
    if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

    var key = e.key.toLowerCase();
    if (key === 'n') {
      e.preventDefault();
      advance();
    } else if (key === 'r') {
      e.preventDefault();
      reset();
    } else if (key === 'f') {
      e.preventDefault();
      fastMode = !fastMode;
      console.log('[ChatApp] Fast mode ' + (fastMode ? 'ON' : 'OFF'));
    }
  });

  // Listen for hotkeys forwarded from parent
  B.on('hotkey', function(data) {
    if (data.key === 'n') advance();
    else if (data.key === 'r') reset();
    else if (data.key === 'f') { fastMode = !fastMode; console.log('[ChatApp] Fast mode ' + (fastMode ? 'ON' : 'OFF')); }
  });

  // ── Initialize ──

  // Set title from config
  var titleEl = document.getElementById('chat-title');
  if (titleEl && config.panelTitle) {
    titleEl.textContent = config.panelTitle;
  }

  var subtitleEl = document.getElementById('chat-subtitle');
  if (subtitleEl && config.projectSubtitle) {
    subtitleEl.textContent = config.projectSubtitle;
  }

  // Create all non-spawnOnly chats at startup
  if (config.chats && config.chats.length > 0) {
    var startupChats = config.chats.filter(function(c) { return !c.spawnOnly; });

    startupChats.forEach(function(chatDef) {
      createChatCard(chatDef.id);
    });
    appState.nextChatIndex = startupChats.length;
    appState.activeChatId = startupChats[0].id;
    applyLayout();

    // Auto-play opener segment for each chat:
    // First chat gets animated typing; others are instant (silent populate)
    (async function() {
      for (var i = 0; i < startupChats.length; i++) {
        await autoPlayOpener(startupChats[i].id, i === 0);
      }
    })();
  }

  // Expose for debugging
  window.chatApp = { advance: advance, reset: reset, state: appState, createNewChat: createNewChat };

  console.log('[ChatApp] Ready! ' + config.segments.length + ' segments across ' + config.chats.length + ' chats');
  console.log('  Ctrl+Shift+N — advance active chat');
  console.log('  Ctrl+Shift+R — reset active chat');

})();
