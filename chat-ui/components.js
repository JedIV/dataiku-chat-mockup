/**
 * Component renderers for the chat UI.
 */
window.ChatComponents = (function() {
  'use strict';

  // ── Markdown-lite: bold, links, line breaks ──
  function md(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  }

  // ── Dataset/recipe pill (clickable) ──
  function pill(name, action) {
    var actionAttr = action ? ' data-action="' + escAttr(JSON.stringify(action)) + '"' : '';
    return '<span class="pill"' + actionAttr + '>' + esc(name) + '</span>';
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function escAttr(s) { return s.replace(/"/g, '&quot;'); }

  // ── User message bubble ──
  function userMessage(text, opts) {
    opts = opts || {};
    var div = document.createElement('div');
    div.className = 'msg msg-user';
    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    div.appendChild(bubble);

    if (opts.typing) {
      var chars = text.split('');
      var i = 0;
      var delay = opts.typingDelay || 55;
      div._typePromise = new Promise(function(resolve) {
        function next() {
          if (i >= chars.length) { resolve(); return; }
          bubble.textContent += chars[i++];
          // Vary speed slightly for realism
          var jitter = delay + Math.floor(Math.random() * 30) - 15;
          setTimeout(next, Math.max(20, jitter));
        }
        next();
      });
    } else {
      bubble.textContent = text;
    }

    return div;
  }

  // ── Assistant text block (with optional word streaming) ──
  function assistantText(text, opts) {
    opts = opts || {};
    var div = document.createElement('div');
    div.className = 'msg msg-assistant';

    var textEl = document.createElement('div');
    textEl.className = 'text';

    if (opts.stream) {
      textEl.classList.add('word-stream');
      textEl.innerHTML = '';
      div.appendChild(textEl);

      // Return the element + a promise for streaming
      div._streamPromise = streamWords(textEl, md(text), opts.streamDelay || 40);
    } else {
      textEl.innerHTML = md(text);
      div.appendChild(textEl);
    }

    return div;
  }

  function streamWords(el, html, delay) {
    return new Promise(function(resolve) {
      var tokens = tokenizeHTML(html);
      var i = 0;

      function next() {
        if (i >= tokens.length) { resolve(); return; }

        var token = tokens[i++];
        if (token.type === 'tag' || token.type === 'space') {
          el.insertAdjacentHTML('beforeend', token.value);
          next();
        } else {
          el.insertAdjacentHTML('beforeend', '<span class="word">' + token.value + '</span>');
          setTimeout(next, delay);
        }
      }

      next();
    });
  }

  function tokenizeHTML(html) {
    var tokens = [];
    var re = /(<[^>]+>)|(\s+)|([^\s<]+)/g;
    var m;
    while ((m = re.exec(html)) !== null) {
      if (m[1]) tokens.push({ type: 'tag', value: m[1] });
      else if (m[2]) tokens.push({ type: 'space', value: m[2] });
      else tokens.push({ type: 'word', value: m[3] });
    }
    return tokens;
  }

  // ── Follow-up text ──
  function followUp(text) {
    var div = document.createElement('div');
    div.className = 'msg-assistant';
    div.innerHTML = '<div class="follow-up">' + md(text) + '</div>';
    return div;
  }

  // ── Status line ──
  function statusLine(icon, text, color) {
    var div = document.createElement('div');
    div.className = 'status-line';
    div.innerHTML = '<span class="icon" style="color:' + (color || '#888') + '">' + icon + '</span>' + md(text);
    return div;
  }

  // ── Plan block ──
  function planBlock(plan) {
    var div = document.createElement('div');
    div.className = 'plan-block';

    var html = '';
    if (plan.intro) {
      html += '<div class="plan-intro">' + md(plan.intro) + '</div>';
    }

    (plan.steps || []).forEach(function(step, idx) {
      html += '<div class="plan-step">';
      html += '<div class="step-num">' + (idx + 1) + '</div>';
      html += '<div class="step-body">';
      html += '<div class="step-label">' + esc(step.label) + '</div>';
      if (step.detail) html += '<div class="step-detail">' + md(step.detail) + '</div>';
      if (step.input || step.output) {
        html += '<div class="step-io">';
        if (step.input) html += '<span style="color:#888">in:</span> ' + pill(step.input) + ' ';
        if (step.output) html += '<span style="color:#888">out:</span> ' + pill(step.output);
        html += '</div>';
      }
      html += '</div></div>';
    });

    html += '<button class="plan-approve-btn" data-approve="true">Approve Plan</button>';

    div.innerHTML = html;
    return div;
  }

  // ── Task card ──
  function taskCard(task) {
    var div = document.createElement('div');
    div.className = 'task-card';
    var html = '<div class="task-title">' + esc(task.title) + '</div>';
    if (task.description) {
      html += '<div class="task-desc">' + md(task.description) + '</div>';
    }
    div.innerHTML = html;
    return div;
  }

  // ── Bar chart (histogram style) ──
  function barChart(chart) {
    var data = chart.data || [];
    var maxValue = Math.max.apply(null, data.map(function(d) { return d.value; }));
    var gridH = 120; // px

    var div = document.createElement('div');
    div.className = 'chart-container';

    var html = '';
    if (chart.title) html += '<div class="chart-title">' + esc(chart.title) + '</div>';

    // Bars
    html += '<div class="chart-grid" style="height:' + gridH + 'px">';
    data.forEach(function(item, idx) {
      var barH = Math.round((item.value / maxValue) * gridH);
      html += '<div class="chart-bar" data-idx="' + idx + '" style="height:' + barH + 'px">';
      html += '<div class="chart-tooltip">' + esc(item.label) + '<br><strong>' + item.value + (chart.unit ? ' ' + esc(chart.unit) : '') + '</strong></div>';
      html += '</div>';
    });
    html += '</div>';

    // X-axis labels
    html += '<div class="chart-x-labels">';
    data.forEach(function(item) {
      html += '<span class="chart-x-label">' + esc(item.label) + '</span>';
    });
    html += '</div>';

    div.innerHTML = html;
    return div;
  }

  // ── Typing indicator ──
  function typingIndicator() {
    var div = document.createElement('div');
    div.className = 'typing-indicator';
    div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    return div;
  }

  return {
    md: md,
    esc: esc,
    pill: pill,
    userMessage: userMessage,
    assistantText: assistantText,
    followUp: followUp,
    statusLine: statusLine,
    planBlock: planBlock,
    taskCard: taskCard,
    barChart: barChart,
    typingIndicator: typingIndicator
  };
})();
