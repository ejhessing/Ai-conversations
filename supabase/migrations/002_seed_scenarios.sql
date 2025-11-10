-- Insert sample scenarios for conversation practice

INSERT INTO public.scenarios (title, persona, difficulty, goal, context, script_seed) VALUES
(
  'Cold Call - Software Sales',
  'Skeptical IT Manager',
  'intermediate',
  'Schedule a 30-minute product demo',
  'You are calling a mid-sized company to introduce your SaaS product. The IT manager is busy and initially resistant.',
  'Hi, this is [persona name], IT Manager at TechCorp. I only have a couple minutes. What is this about?'
),
(
  'Investor Pitch - Series A',
  'Critical Venture Capitalist',
  'advanced',
  'Secure interest for a follow-up meeting',
  'You have 10 minutes to pitch your startup to a senior partner at a top VC firm. They are analytical and ask tough questions.',
  'Thanks for coming in. I have reviewed your deck briefly. Walk me through your business in 3 minutes, then I will have questions.'
),
(
  'Job Interview - Senior Role',
  'Experienced Hiring Manager',
  'advanced',
  'Demonstrate leadership experience and cultural fit',
  'You are interviewing for a senior engineering role. The hiring manager wants to assess both technical leadership and communication skills.',
  'Good morning! Thanks for joining us today. Let's start with you telling me about a time you led a team through a challenging project.'
),
(
  'Networking Event Chat',
  'Friendly Industry Professional',
  'beginner',
  'Build rapport and exchange contact information',
  'You are at a professional networking event. Strike up a conversation with someone in your industry and make a genuine connection.',
  'Hi! I saw you were checking out the speaker's presentation. What did you think? I'm Alex, by the way.'
),
(
  'Customer Support - Angry Client',
  'Frustrated Customer',
  'intermediate',
  'De-escalate and resolve the issue professionally',
  'A customer is calling about a billing error that has been ongoing for two months. They are upset and considering canceling their subscription.',
  'Finally! I have been trying to reach someone for weeks. Your company charged me twice last month and no one has fixed it. This is unacceptable!'
),
(
  'Team Conflict Resolution',
  'Defensive Team Member',
  'advanced',
  'Address performance concerns while maintaining trust',
  'You need to discuss missed deadlines with a talented but recently underperforming team member. They may become defensive.',
  'Hey, you wanted to talk? Is this about the last sprint? I know I missed the deadline, but I had a lot going on.'
),
(
  'Salary Negotiation',
  'Budget-Conscious HR Director',
  'advanced',
  'Negotiate a 15% salary increase',
  'You are discussing compensation after receiving a competing job offer. The company values you but has budget constraints.',
  'I appreciate you bringing this to my attention. Let's talk about your current compensation and what you are looking for.'
),
(
  'Public Speaking - Conference Talk',
  'Engaged Audience',
  'intermediate',
  'Deliver a compelling 5-minute talk introduction',
  'You are opening a conference presentation on a technical topic. Engage the audience and establish credibility quickly.',
  '[Applause dies down] Thank you for joining my session today. Before we dive in, I would love to hear - how many of you have experienced this problem firsthand?'
);

-- Insert sample badges

INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first conversation practice', 'steps', 'sessions_completed', 1),
('Conversationalist', 'Complete 10 practice sessions', 'chat', 'sessions_completed', 10),
('Marathon Speaker', 'Complete 50 practice sessions', 'trophy', 'sessions_completed', 50),
('Clear Communicator', 'Achieve clarity score of 8+ in 5 sessions', 'target', 'high_clarity_count', 5),
('Filler Slayer', 'Complete a session with zero filler words', 'zap', 'zero_filler_sessions', 1),
('Week Warrior', 'Practice 7 days in a row', 'fire', 'streak_days', 7),
('Monthly Master', 'Practice 30 days in a row', 'calendar', 'streak_days', 30),
('Empathy Expert', 'Achieve empathy score of 9+ in 3 sessions', 'heart', 'high_empathy_count', 3),
('Confidence King', 'Achieve confidence score of 9+ in 5 sessions', 'crown', 'high_confidence_count', 5),
('Speed Speaker', 'Maintain 150-170 WPM in 3 sessions', 'bolt', 'optimal_pace_count', 3);
