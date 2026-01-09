/**
 * Flow Assistant Fake Chat - Configuration
 *
 * Edit this file to customize your fake conversation.
 * Paste this into the browser console BEFORE the main script.
 *
 * Message format:
 *   User:      { role: 'user', text: 'Your message here' }
 *   Assistant: { role: 'assistant', content: { intro, tasks, footer } }
 *
 * Task format:
 *   { title, inputs: [], outputs: [], description }
 *
 * Use <span style="color:#28a9dd">text</span> to highlight dataset/column names
 * Use <em>text</em> for italics
 */

window.fakeChatConfig = {
  conversation: [
    {
      role: 'user',
      text: 'Give me summary statistics about the energy consumption data'
    },
    {
      role: 'assistant',
      content: {
        intro: 'We first need to convert the consumption column from string to a numeric type so that we can compute numeric aggregations on it. Then we use a grouping recipe with no grouping keys (global aggregation) to compute the count of rows along with sum, average, minimum, maximum, and standard deviation of <em>consomation</em>.',
        tasks: [
          {
            title: 'Prepare Data',
            inputs: ['data'],
            outputs: ['data_prepared'],
            description: 'Create a prepare recipe to convert column <span style="color:#28a9dd">consomation</span> to numeric type using the auto type parser'
          },
          {
            title: 'Grouping Data',
            inputs: ['data_prepared'],
            outputs: ['energy_consumption_summary'],
            description: 'Create a grouping recipe to compute global summary statistics (count, sum, average, min, max, stddev) on column <span style="color:#28a9dd">consomation</span>'
          }
        ],
        footer: 'If you\'re happy with the plan, click Create Flow. Otherwise, describe the changes you\'d like.'
      }
    },
    {
      role: 'user',
      text: 'Can you also analyze patterns by time of day?'
    },
    {
      role: 'assistant',
      content: {
        intro: 'I\'ll add a step to extract the hour from your timestamp and then group by hour to analyze consumption patterns throughout the day.',
        tasks: [
          {
            title: 'Prepare Data',
            inputs: ['data'],
            outputs: ['data_with_hour'],
            description: 'Extract hour from <span style="color:#28a9dd">DATE_LOCAL</span> column'
          },
          {
            title: 'Group by Hour',
            inputs: ['data_with_hour'],
            outputs: ['hourly_patterns'],
            description: 'Compute average consumption grouped by hour of day'
          }
        ],
        footer: 'This will show you which hours have the highest and lowest energy consumption.'
      }
    }
  ],

  // Timing settings
  typingSpeed: 30,        // ms per character for user message animation
  aiResponseDelay: 800    // ms before showing AI response
};

console.log('[FakeChat] Config loaded with', window.fakeChatConfig.conversation.length, 'messages');
