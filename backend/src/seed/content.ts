/**
 * Content Management Seed Data (Categories, Tags, Posts, Pages)
 */
import type { Payload } from 'payload'

import { createRichText } from './utils.js'
const categoriesData = [
    { name: 'Leadership', slug: 'leadership', description: 'Articles about leadership skills, team management, and executive development' },
    { name: 'Career Development', slug: 'career-development', description: 'Career growth, transitions, and professional advancement' },
    { name: 'Entrepreneurship', slug: 'entrepreneurship', description: 'Starting and growing businesses, startup culture, and founder insights' },
    { name: 'Wellness', slug: 'wellness', description: 'Mental health, work-life balance, and holistic well-being' },
    { name: 'Technology', slug: 'technology', description: 'Tech trends, digital skills, and innovation' },
    { name: 'Communication', slug: 'communication', description: 'Public speaking, presentations, and interpersonal skills' },
    { name: 'Productivity', slug: 'productivity', description: 'Time management, efficiency, and getting things done' },
    { name: 'Finance', slug: 'finance', description: 'Personal finance, investing, and financial planning' },
]

const tagsData = [
    { name: 'Beginner', slug: 'beginner' },
    { name: 'Advanced', slug: 'advanced' },
    { name: 'Quick Tips', slug: 'quick-tips' },
    { name: 'Deep Dive', slug: 'deep-dive' },
    { name: 'Case Study', slug: 'case-study' },
    { name: 'Interview', slug: 'interview' },
    { name: 'How-To', slug: 'how-to' },
    { name: 'Opinion', slug: 'opinion' },
    { name: 'Research', slug: 'research' },
    { name: 'Tools', slug: 'tools' },
    { name: 'Frameworks', slug: 'frameworks' },
    { name: 'Remote Work', slug: 'remote-work' },
    { name: 'AI', slug: 'ai' },
    { name: 'Mindfulness', slug: 'mindfulness' },
    { name: 'Networking', slug: 'networking' },
]

type AccessLevel = 'public' | 'subscribers'

const postsData: { title: string; slug: string; excerpt: string; accessLevel: AccessLevel; categorySlug: string; tagSlugs: string[]; content: string }[] = [
    {
        title: '10 Essential Leadership Skills for the Modern Workplace',
        slug: 'essential-leadership-skills-modern-workplace',
        excerpt: 'Discover the key leadership competencies that drive success in today\'s rapidly evolving business environment.',
        accessLevel: 'public',
        categorySlug: 'leadership',
        tagSlugs: ['beginner', 'how-to'],
        content: `
            <p>In today's fast-paced business world, effective leadership is more crucial than ever. It's no longer just about giving orders; it's about inspiring teams, navigating uncertainty, and driving innovation. Here are the 10 essential skills every modern leader needs to master.</p>

            <h3>1. Emotional Intelligence (EQ)</h3>
            <p>The ability to understand and manage your own emotions, as well as those of others, is the cornerstone of effective leadership. Leaders with high EQ can build stronger relationships and navigate conflicts with empathy.</p>

            <h3>2. Adaptability</h3>
            <p>Change is the only constant. Modern leaders must be able to pivot strategies quickly and guide their teams through transitions without losing momentum.</p>

            <h3>3. Communication</h3>
            <p>Clear, transparent communication fosters trust. It's not just about speaking well, but also about active listening and ensuring that your message is understood at all levels.</p>

            <h3>4. Decisiveness</h3>
            <p>Analysis paralysis can kill progress. Leaders need to be able to make informed decisions promptly, even with incomplete information, and then stand by them.</p>

            <h3>5. Empathy</h3>
            <p>Understanding the unique challenges and motivations of your team members allows you to support them effectively and creates a positive, inclusive work culture.</p>
            
            <h3>6. Strategic Thinking</h3>
            <p>Great leaders don't just put out fires; they look ahead. They can visualize the future and develop actionable plans to get there.</p>

            <h3>7. Delegation</h3>
            <p>Micro-management stifles growth. Effective delegation empowers team members, helps them develop new skills, and frees up your time for high-level strategy.</p>

            <h3>8. Integrity</h3>
            <p>Leading by example is powerful. When leaders act with honesty and integrity, they set a standard for the entire organization.</p>

            <h3>9. Tech Savviness</h3>
            <p>You don't need to be a coder, but you do need to understand how technology impacts your industry and how to leverage tools to improve efficiency.</p>

            <h3>10. Resilience</h3>
            <p>Setbacks are inevitable. The best leaders view failures as learning opportunities and can bounce back quickly, keeping morale high.</p>

            <p><strong>Conclusion:</strong> Developing these skills takes time and practice, but the investment is well worth it. Start by focusing on one or two areas and consistently work to improve.</p>
        `,
    },
    {
        title: 'The Art of Giving Constructive Feedback',
        slug: 'art-of-giving-constructive-feedback',
        excerpt: 'Learn how to deliver feedback that motivates and develops your team members.',
        accessLevel: 'subscribers',
        categorySlug: 'leadership',
        tagSlugs: ['deep-dive', 'frameworks'],
        content: `
            <p>Giving feedback is one of the most difficult parts of a manager's job, but it's also one of the most important. When done correctly, it catalyzes growth; when done poorly, it breeds resentment.</p>

            <h3>The SBI Model</h3>
            <p>One effective framework for giving feedback is the SBI model: Situation, Behavior, Impact.</p>
            <ul>
                <li><strong>Situation:</strong> Describe the specific context where the behavior occurred. Be specific about time and place.</li>
                <li><strong>Behavior:</strong> Describe the actual, observable behavior. Avoid making judgments or assumptions about their intent.</li>
                <li><strong>Impact:</strong> Explain how the behavior affected you, the team, or the project. This helps the recipient understand the consequences of their actions.</li>
            </ul>

            <h3>Example:</h3>
            <p><em>"During the team meeting yesterday morning (Situation), when I asked for updates, you interrupted me three times (Behavior). This made it difficult for me to get through the agenda and made me feel undermined (Impact)."</em></p>

            <h3>Tips for Success</h3>
            <p>Establish a culture of continuous feedback, not just annual reviews. Make it a two-way street by asking for feedback on your own performance as well. Remember, the goal is always improvement, not punishment.</p>
        `,
    },
    {
        title: 'Navigating Your First Career Transition',
        slug: 'navigating-first-career-transition',
        excerpt: 'A comprehensive guide to successfully changing careers while minimizing risks.',
        accessLevel: 'public',
        categorySlug: 'career-development',
        tagSlugs: ['beginner', 'how-to', 'case-study'],
        content: `
            <p>Thinking about changing careers? You're not alone. The average person changes careers 5-7 times in their life. However, making the leap can be daunting. Here is a roadmap to navigate your first major transition.</p>
            
            <h3>1. Self-Assessment</h3>
            <p>Before looking outward, look inward. What are your values? What skills do you enjoy using? What are your non-negotiables? Tools like the Myers-Briggs Type Indicator or StrengthsFinder can provide insights.</p>

            <h3>2. Research and Gap Analysis</h3>
            <p>Identify the role you want and research it thoroughly. Look at job descriptions and identify the skills you lack. This is your "gap."</p>

            <h3>3. Bridge the Gap</h3>
            <p>Take courses, earn certifications, or work on personal projects to build the necessary skills. In today's digital age, resources are abundant.</p>

            <h3>4. Network, Network, Network</h3>
            <p>70-80% of jobs are not published. Reach out to professionals in your target industry for informational interviews. Learn about their day-to-day reality.</p>

            <h3>5. Rebrand Yourself</h3>
            <p>Update your LinkedIn profile and resume to highlight transferable skills. Frame your past experience in a way that is relevant to your new path.</p>

            <p><strong>Remember:</strong> A career transition is a marathon, not a sprint. Be patient with yourself and celebrate small victories along the way.</p>
        `,
    },
    {
        title: 'Building Your Personal Brand in Tech',
        slug: 'building-personal-brand-tech',
        excerpt: 'Strategic approaches to establishing yourself as a thought leader in the technology industry.',
        accessLevel: 'subscribers',
        categorySlug: 'career-development',
        tagSlugs: ['advanced', 'deep-dive'],
        content: `
            <p>In the competitive tech landscape, your personal brand is your differentiator. It's what people say about you when you're not in the room. Here is how to cultivate a brand that opens doors.</p>

            <h3>Define Your Niche</h3>
            <p>You can't be everything to everyone. Are you the AI ethics expert? The frontend performance guru? The compassionate engineering leader? distinct positioning helps you stand out.</p>

            <h3>Content Creation</h3>
            <p>Share your knowledge. Write blog posts, contribute to open source, or speak at meetups. Consistency is key. You don't need to be an expert to share what you're learning.</p>

            <h3>Authenticity Matters</h3>
            <p>Don't curate a fake persona. People connect with vulnerability and authenticity. Share your failures as well as your successes.</p>

            <h3>Engage with the Community</h3>
            <p>Don't just broadcast; interact. Comment on others' work, mentor junior developers, and participate in discussions. value you give returns to you tenfold.</p>
        `,
    },
    {
        title: 'From Side Hustle to Startup: A Founder\'s Journey',
        slug: 'side-hustle-to-startup-founders-journey',
        excerpt: 'Real stories from entrepreneurs who turned their passion projects into successful businesses.',
        accessLevel: 'public',
        categorySlug: 'entrepreneurship',
        tagSlugs: ['case-study', 'interview'],
        content: `
            <p>Many great companies started as side projects. GitHub, Slack, and Craigslist all began as hobbies. But how do you know when to quit your day job and go all in? We interviewed three founders to find out.</p>

            <h3>The Validation Phase</h3>
            <p>Sarah, founder of 'EcoEats', spent six months selling her sustainable meal kits at local markets on weekends before leaving her corporate marketing role. "I didn't quit until I had consistent repeat customers," she says. Validation reduces risk.</p>

            <h3>The Financial Runway</h3>
            <p>Mark, who built a SaaS tool for designers, saved 12 months of living expenses. "It took way longer to get revenue than I expected. That savings account saved my business," he admits.</p>

            <h3>The Tipping Point</h3>
            <p>For most, the tipping point comes when the side hustle demands more time than the day job allows, or when the side income rivals the salary. Trust your gut, but verifying with data is safer.</p>
        `,
    },
    {
        title: 'Fundraising 101: Preparing for Your First Pitch',
        slug: 'fundraising-101-preparing-first-pitch',
        excerpt: 'Everything you need to know before approaching investors for seed funding.',
        accessLevel: 'subscribers',
        categorySlug: 'entrepreneurship',
        tagSlugs: ['beginner', 'how-to', 'frameworks'],
        content: `
            <p>Raising capital is a full-time job. Before you schedule your first meeting with a VC or angel investor, ensure you are prepared.</p>

            <h3>The Pitch Deck</h3>
            <p>Your deck should be 10-15 slides maximum. Key slides include: Problem, Solution, Market Size, Traction, Team, and The Ask. Keep it visual and concise.</p>

            <h3>Know Your Numbers</h3>
            <p>You must know your CAC (Customer Acquisition Cost), LTV (Lifetime Value), MRR (Monthly Recurring Revenue), and burn rate inside out. Hesitation here signals incompetence.</p>

            <h3>The Narrative</h3>
            <p>Investors buy into stories, not just spreadsheets. Why this? Why now? Why you? Craft a compelling narrative that paints a picture of a massive opportunity.</p>

            <h3>Due Diligence</h3>
            <p>Have your data room ready. This includes legal documents, cap table, financial projections, and employee contracts. Organized founders signal disciplined operators.</p>
        `,
    },
    {
        title: 'Mindfulness Practices for Busy Professionals',
        slug: 'mindfulness-practices-busy-professionals',
        excerpt: 'Simple techniques to reduce stress and increase focus during your workday.',
        accessLevel: 'public',
        categorySlug: 'wellness',
        tagSlugs: ['quick-tips', 'mindfulness'],
        content: `
            <p>You don't need a yoga mat or an hour of silence to practice mindfulness. Here are micro-practices you can integrate into your busy workday.</p>

            <h3>The One-Minute Breath</h3>
            <p>Before starting a new task or meeting, take one minute to focus solely on your breath. Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. This 'box breathing' resets your nervous system.</p>

            <h3>Mindful Coffee</h3>
            <p>Instead of gulping down your coffee while checking emails, spend the first few sips doing nothing else. Notice the warmth, the aroma, and the taste. It grounds you in the present moment.</p>

            <h3>The Transition Ritual</h3>
            <p>Create a ritual to mark the end of your workday. Close your laptop, tidy your desk, and mentally 'clock out'. This helps separate work stress from personal time.</p>
        `,
    },
    {
        title: 'Building Sustainable Work-Life Balance',
        slug: 'building-sustainable-work-life-balance',
        excerpt: 'Long-term strategies for maintaining well-being while pursuing ambitious career goals.',
        accessLevel: 'subscribers',
        categorySlug: 'wellness',
        tagSlugs: ['deep-dive', 'mindfulness', 'remote-work'],
        content: `
            <p>Work-life balance is not a static state to achieve; it's a dynamic equilibrium to maintain. It requires constant adjustment and boundary setting.</p>

            <h3>The Myth of 50/50</h3>
            <p>Balance doesn't mean equal time. It means allocating energy in a way that aligns with your current priorities. Some seasons will be work-heavy; others will be life-heavy.</p>

            <h3>Setting Boundaries</h3>
            <p>In a hyper-connected world, you must defend your downtime. Turn off notifications after hours. Learn to say 'no' to non-essential commitments. Your energy is a finite resource.</p>

            <h3>The Importance of Recovery</h3>
            <p>High performance requires high recovery. Prioritize sleep, nutrition, and movement. Treat your recovery time with the same respect as your work meetings.</p>
        `,
    },
    {
        title: 'AI Tools Every Professional Should Know',
        slug: 'ai-tools-every-professional-should-know',
        excerpt: 'A curated list of AI-powered tools that can supercharge your productivity.',
        accessLevel: 'public',
        categorySlug: 'technology',
        tagSlugs: ['tools', 'ai', 'quick-tips'],
        content: `
            <p>Artificial Intelligence is no longer sci-fi; it's a productivity multiplier. Here are the tools that are reshaping how we work.</p>

            <h3>1. ChatGPT / Claude</h3>
            <p>For drafting emails, brainstorming ideas, and summarizing long documents. Learning prompt engineering is the new essential skill.</p>

            <h3>2. Notion AI</h3>
            <p>Integrated directly into your workspace, it can organize notes, generate action items, and improve your writing instantly.</p>

            <h3>3. Midjourney / DALL-E</h3>
            <p>For creating custom visuals, mockups, and presentation assets without needing a graphic designer.</p>

            <h3>4. Otter.ai</h3>
            <p>Never take meeting notes again. Otter records, transcribes, and summarizes your meetings automatically.</p>
        `,
    },
    {
        title: 'Future of Work: Trends Shaping 2025 and Beyond',
        slug: 'future-of-work-trends-2025',
        excerpt: 'Expert predictions on how technology will transform the workplace.',
        accessLevel: 'subscribers',
        categorySlug: 'technology',
        tagSlugs: ['research', 'ai', 'remote-work', 'opinion'],
        content: `
            <p>The workplace is undergoing a seismic shift. Based on current data and expert analysis, here is what the future of work looks like.</p>

            <h3>Hybrid is Here to Stay</h3>
            <p>The debate is over. Flexible work arrangements are a non-negotiable for top talent. Offices will become collaboration hubs, not daily destinations.</p>

            <h3>Skills > Degrees</h3>
            <p>Companies are moving towards skills-based hiring. Portfolios and certifications are becoming more valuable than traditional university degrees.</p>

            <h3>The Rise of the 'Super-Employee'</h3>
            <p>Workers augmented by AI tools will achieve productivity levels previously thought impossible. The divide between those who use AI and those who don't will widen.</p>
        `,
    },
    {
        title: 'Mastering the Art of Public Speaking',
        slug: 'mastering-art-public-speaking',
        excerpt: 'Proven techniques to overcome stage fright and deliver compelling presentations.',
        accessLevel: 'public',
        categorySlug: 'communication',
        tagSlugs: ['beginner', 'how-to'],
        content: `
            <p>Public speaking is the #1 fear for many, yet it's a high-leverage skill that can accelerate your career. Here is how to conquer the stage.</p>

            <h3>Preparation is Key</h3>
            <p>Don't memorize a script; internalize your key points. Rehearse until the structure flows naturally. Know your opening and closing lines cold.</p>

            <h3>The pwer of Pausing</h3>
            <p>Nervous speakers rush. enhancing silence shows confidence and gives the audience time to digest your points. Take a breath.</p>

            <h3>Connect with the Audience</h3>
            <p>Make eye contact. Tell stories. Use humor. Make it about *them*, not about you. When you focus on adding value to the audience, your anxiety diminishes.</p>
        `,
    },
    {
        title: 'Executive Presence: Commanding Any Room',
        slug: 'executive-presence-commanding-any-room',
        excerpt: 'Advanced strategies for projecting authority and influence in high-stakes situations.',
        accessLevel: 'subscribers',
        categorySlug: 'communication',
        tagSlugs: ['advanced', 'deep-dive', 'frameworks'],
        content: `
            <p>Executive presence is that 'X-factor' that leaders possess. It's a combination of gravitas, communication, and appearance. But it can be learned.</p>

            <h3>Composure Under Fire</h3>
            <p>True leaders stay calm when things go wrong. They respond, they don't react. This emotional stability instills confidence in others.</p>

            <h3>Concise Communication</h3>
            <p>Executives value time. Get to the point. Start with the headline (the BLUF method - Bottom Line Up Front). Be clear, concise, and compelling.</p>

            <h3>Body Language</h3>
            <p>Take up space. Stand tall. Use open gestures. Your physical presence communicates authority before you even speak a word.</p>
        `,
    },
    {
        title: 'The Pomodoro Technique: A Complete Guide',
        slug: 'pomodoro-technique-complete-guide',
        excerpt: 'How to use time-boxing to dramatically increase your daily output.',
        accessLevel: 'public',
        categorySlug: 'productivity',
        tagSlugs: ['beginner', 'how-to', 'tools'],
        content: `
            <p>Francesco Cirillo developed the Pomodoro Technique in the late 1980s. It uses a kitchen timer to break work into intervals, typically 25 minutes in length, separated by short breaks.</p>

            <h3>How it Works</h3>
            <ol>
                <li>Choose a task to be accomplished.</li>
                <li>Set the Pomodoro to 25 minutes.</li>
                <li>Work on the task until the Pomodoro rings.</li>
                <li>Take a short break (5 minutes).</li>
                <li>Every 4 Pomodoros, take a longer break (15-30 minutes).</li>
            </ol>

            <h3>Why it Works</h3>
            <p>The ticking timer creates a sense of urgency. The frequent breaks keep your mind fresh. It turns work into a series of small, manageable sprints rather than a marathon slog.</p>
        `,
    },
    {
        title: 'Building a Second Brain: Knowledge Management',
        slug: 'building-second-brain-knowledge-management',
        excerpt: 'Create a personal knowledge system that amplifies your thinking and creativity.',
        accessLevel: 'subscribers',
        categorySlug: 'productivity',
        tagSlugs: ['advanced', 'deep-dive', 'tools', 'frameworks'],
        content: `
            <p>We are drowning in information but starving for wisdom. 'Building a Second Brain' (BASB), popularized by Tiago Forte, is a methodology for saving and reminding us of the ideas, inspirations, and insights we gain.</p>

            <h3>CAPTURE</h3>
            <p>Keep what resonates. Save highlights, notes, and images in a digital notes app (like Notion, Evernote, or Obsidian). Don't trust your memory.</p>

            <h3>ORGANIZE</h3>
            <p>Save for actionability, not by topic. Use the PARA method: Projects (current), Areas (ongoing responsibilities), Resources (topics of interest), and Archives (completed items).</p>

            <h3>DISTILL</h3>
            <p>Find the essence. Summarize your notes. Turn bold highlights into executive summaries. Make your future self thank you.</p>

            <h3>EXPRESS</h3>
            <p>Show your work. Use your gathered knowledge to create content, solve problems, and lead projects. Knowledge only has value when applied.</p>
        `,
    },
    {
        title: 'Investment Basics for Beginners',
        slug: 'investment-basics-beginners',
        excerpt: 'Start your investment journey with these fundamental concepts and strategies.',
        accessLevel: 'public',
        categorySlug: 'finance',
        tagSlugs: ['beginner', 'how-to'],
        content: `
            <p>Investing is the most reliable way to build wealth over time. But where do you start? Here are the basics.</p>

            <h3>Compound Interest</h3>
            <p>Einstein called it the eighth wonder of the world. It's interest on interest. The earlier you start, the more powerful it becomes. Time is your greatest asset.</p>

            <h3>Diversification</h3>
            <p>Don't put all your eggs in one basket. Spread your investments across stocks, bonds, and real estate to minimize risk.</p>

            <h3>Index Funds</h3>
            <p>For most people, low-cost index funds (like the S&P 500) are the best strategy. They offer broad market exposure and historically outperform most actively managed funds.</p>
        `,
    },
    {
        title: 'Building Wealth Through Diversification',
        slug: 'building-wealth-through-diversification',
        excerpt: 'Advanced portfolio strategies for long-term financial growth.',
        accessLevel: 'subscribers',
        categorySlug: 'finance',
        tagSlugs: ['advanced', 'deep-dive', 'research'],
        content: `
            <p>Once you have the basics down, it's time to optimize. True diversification goes beyond just owning different stocks.</p>

            <h3>Asset Class Correlation</h3>
            <p>The goal is to own assets that don't move in lockstep. When stocks go down, bonds often go up. Real estate, gold, and crypto can offer further uncorrelation.</p>

            <h3>Geographic Diversification</h3>
            <p>Don't suffer from 'home bias'. Emerging markets and developed international markets offer growth opportunities outside your domestic economy.</p>

            <h3>Rebalancing</h3>
            <p>Regularly adjusting your portfolio back to your target allocation forces you to 'sell high and buy low' systematically, removing emotion from the process.</p>
        `,
    },
    {
        title: 'Remote Team Management Best Practices',
        slug: 'remote-team-management-best-practices',
        excerpt: 'Lessons learned from leading distributed teams across time zones.',
        accessLevel: 'public',
        categorySlug: 'leadership',
        tagSlugs: ['remote-work', 'how-to', 'case-study'],
        content: `
            <p>Managing a remote team requires a different set of muscles than managing in an office. It requires intention.</p>

            <h3>Over-Communicate</h3>
            <p>In the absence of hallway chats, information silos happen easily. Default to transparency. Document everything. If it's not written down, it didn't happen.</p>

            <h3>Focus on Outcomes, Not Hours</h3>
            <p>Stop watching the clock. Judge performance by output and results. Trust your team to manage their own schedules.</p>

            <h3>Create Virtual Watercoolers</h3>
            <p> dedicate time for non-work bonding. Virtual coffees, gaming sessions, or just a #random Slack channel help build the social glue that holds a team together.</p>
        `,
    },
    {
        title: 'The Science of Motivation',
        slug: 'science-of-motivation',
        excerpt: 'Understanding what drives human behavior and how to apply it.',
        accessLevel: 'subscribers',
        categorySlug: 'leadership',
        tagSlugs: ['research', 'deep-dive', 'frameworks'],
        content: `
            <p>What really drives us? Daniel Pink's research in 'Drive' highlights three main intrinsic motivators that are far more powerful than money (carrots) or punishment (sticks).</p>

            <h3>1. Autonomy</h3>
            <p>The desire to direct our own lives. Give your team control over the 'how', 'when', and 'where' of their work.</p>

            <h3>2. Mastery</h3>
            <p>The urge to get better and better at something that matters. Provide opportunities for learning, challenge, and growth.</p>

            <h3>3. Purpose</h3>
            <p>The yearning to do what we do in the service of something larger than ourselves. Connect every task to the company's broader mission.</p>
        `,
    },
    {
        title: 'Networking in the Digital Age',
        slug: 'networking-digital-age',
        excerpt: 'Build meaningful professional relationships online and offline.',
        accessLevel: 'public',
        categorySlug: 'career-development',
        tagSlugs: ['networking', 'how-to', 'quick-tips'],
        content: `
            <p>Networking isn't about collecting business cards; it's about building relationships. In a digital world, your network is your net worth.</p>

            <h3>The 'Give First' Mentality</h3>
            <p>Don't reach out only when you need something. Approach networking with the mindset of "How can I help you?" Make introductions, share resources, and offer value.</p>

            <h3>LinkedIn Strategy</h3>
            <p>Optimize your profile. Engage with comments, don't just lurk. Send personalized connection requests explaining *why* you want to connect.</p>

            <h3>Curate Your Inner Circle</h3>
            <p>Jim Rohn said, "You are the average of the five people you spend the most time with." Surround yourself with people who challenge and inspire you.</p>
        `,
    },
    {
        title: 'Salary Negotiation Masterclass',
        slug: 'salary-negotiation-masterclass',
        excerpt: 'Proven scripts and strategies for your next compensation discussion.',
        accessLevel: 'subscribers',
        categorySlug: 'career-development',
        tagSlugs: ['advanced', 'frameworks', 'deep-dive'],
        content: `
            <p>You don't get what you deserve; you get what you negotiate. Avoiding this conversation can cost you over $500k in lifetime earnings.</p>

            <h3>Do Your Homework</h3>
            <p>Use sites like Glassdoor, Levels.fyi, and Payscale to find the market rate for your role and location. Come armed with data.</p>

            <h3>Anchor High</h3>
            <p>The first number spoken anchors the negotiation. If forced to give a number, give a range where the bottom is your target salary.</p>

            <h3>Negotiate Total Compensation</h3>
            <p>It's not just about base salary. Negotiate equity, sign-on bonuses, vacation time, learning stipends, and flexible hours. Be creative.</p>
        `,
    },
]

const pagesData = [
    {
        title: 'About Us',
        slug: 'about',
        content: `
            <h2>Our Mission</h2>
            <p>At Pathway, we believe that professional growth should be accessible, structured, and continuous. Our mission is to bridge the gap between ambition and achievement by connecting learners with world-class coaches and actionable learning paths.</p>
            
            <h2>Our Story</h2>
            <p>Founded in 2023, Pathway began with a simple question: "Why is professional development often so fragmented?" We realized that while there is an abundance of content online, there was a lack of structured guidance and personalized mentorship. We set out to build a platform that combines the best of e-learning with the human touch of coaching.</p>

            <h2>Our Values</h2>
            <ul>
                <li><strong>Empowerment:</strong> We give you the tools to take control of your career.</li>
                <li><strong>Community:</strong> Growth happens faster when we learn together.</li>
                <li><strong>Excellence:</strong> We are committed to high-quality content and coaching.</li>
                <li><strong>Integrity:</strong> We believe in honest, transparent, and ethical practices.</li>
            </ul>

            <h2>Meet the Team</h2>
            <p>Our diverse team of educators, engineers, and creatives works tirelessly to create the best learning experience for you. We are headquartered in San Francisco but work remotely from all corners of the globe.</p>
        `,
    },
    {
        title: 'Careers',
        slug: 'careers',
        content: `
            <h2>Join Our Team</h2>
            <p>We are on a mission to transform professional development, and we need your help. If you are passionate about education, technology, and helping others succeed, Pathway might be the perfect place for you.</p>

            <h2>Why Work With Us?</h2>
            <ul>
                <li><strong>Remote-First Culture:</strong> Work from anywhere in the world.</li>
                <li><strong>Continuous Learning:</strong> We practice what we preach. All employees get a generous learning stipend.</li>
                <li><strong>Impact:</strong> Your work directly helps people improve their lives and careers.</li>
                <li><strong>Competitive Compensation:</strong> We offer market-leading salaries and equity packages.</li>
            </ul>

            <h2>Open Positions</h2>
            <h3>Engineering</h3>
            <ul>
                <li>Senior Full Stack Engineer</li>
                <li>DevOps Specialist</li>
            </ul>

            <h3>Content & Coaching</h3>
            <ul>
                <li>Lead Instructional Designer</li>
                <li>Coach Success Manager</li>
            </ul>

            <p>Don't see a role that fits? Email your resume to careers@pathway.com and tell us how you can contribute.</p>
        `,
    },
    {
        title: 'Contact Us',
        slug: 'contact',
        content: `
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Whether you have a question about our courses, need support, or just want to share your feedback, our team is here to help.</p>

            <h3>General Inquiries</h3>
            <p>Email: hello@pathway.com<br>
            Phone: +1 (555) 123-4567</p>

            <h3>Support</h3>
            <p>For technical issues or account help, please visit our Help Center or email support@pathway.com.</p>

            <h3>Office Address</h3>
            <p>Pathway Inc.<br>
            123 Innovation Way, Suite 400<br>
            San Francisco, CA 94103<br>
            USA</p>

            <h3>Follow Us</h3>
            <p>Stay updated with the latest news and tips by following us on social media:</p>
            <ul>
                <li>LinkedIn: /company/pathway</li>
                <li>Twitter: @pathway_learning</li>
                <li>Instagram: @pathway_official</li>
            </ul>
        `,
    },
    {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: `
            <h2>Privacy Policy</h2>
            <p><strong>Last Updated: January 1, 2024</strong></p>

            <p>At Pathway, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.</p>

            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact support. This may include your name, email address, payment information, and profile details.</p>

            <h3>2. How We Use Your Information</h3>
            <p>We use your information to:</p>
            <ul>
                <li>Provide, maintain, and improve our services.</li>
                <li>Process transactions and send related information.</li>
                <li>Communicate with you about new courses, features, and events.</li>
                <li>Personalize your learning experience.</li>
            </ul>

            <h3>3. Data Security</h3>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>

            <h3>4. Your Rights</h3>
            <p>You have the right to access, correct, or delete your personal information. You can manage your preferences in your account settings or contact us at privacy@pathway.com.</p>
        `,
    },
    {
        title: 'Terms of Service',
        slug: 'terms',
        content: `
            <h2>Terms of Service</h2>
            <p><strong>Last Updated: January 1, 2024</strong></p>

            <p>Please read these Terms of Service ("Terms") carefully before using the Pathway platform operated by Pathway Inc.</p>

            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>

            <h3>2. Accounts</h3>
            <p>When you create an account with us, you must provide ensuring that the information is accurate, complete, and current. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>

            <h3>3. Intellectual Property</h3>
            <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Pathway Inc. and its licensors.</p>

            <h3>4. Termination</h3>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        `,
    },
    {
        title: 'Cookie Policy',
        slug: 'cookies',
        content: `
            <h2>Cookie Policy</h2>
            <p>This Cookie Policy explains how Pathway uses cookies and similar technologies to recognize you when you visit our website.</p>

            <h3>What are cookies?</h3>
            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

            <h3>Why do we use cookies?</h3>
            <p>We use cookies for several reasons:</p>
            <ul>
                <li><strong>Essential Cookies:</strong> These are required for technical reasons in order for our website to operate.</li>
                <li><strong>Performance Cookies:</strong> These allow us to track and target the interests of our users to enhance the experience on our Online Properties.</li>
                <li><strong>Analytics Cookies:</strong> These help us understand how our website is being used and how effective our marketing campaigns are.</li>
            </ul>

            <h3>How can I control cookies?</h3>
            <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.</p>
        `,
    },
]



export async function seedCategories(payload: Payload) {
    console.log('   Creating/Updating categories...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const catData of categoriesData) {
        try {
            const existing = await payload.find({
                collection: 'categories',
                where: { slug: { equals: catData.slug } },
                limit: 1,
            })

            if (existing.docs.length === 0) {
                const cat = await payload.create({
                    collection: 'categories',
                    data: catData,
                })
                created.push(cat)
            } else {
                const cat = await payload.update({
                    collection: 'categories',
                    id: existing.docs[0].id,
                    data: catData,
                })
                created.push(cat)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding category ${catData.slug}: ${(e as Error).message}`)
        }
    }

    console.log(`   Processed ${created.length} categories`)
    return created
}

export async function seedTags(payload: Payload) {
    console.log('   Creating/Updating tags...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (const tagData of tagsData) {
        try {
            const existing = await payload.find({
                collection: 'tags',
                where: { slug: { equals: tagData.slug } },
                limit: 1,
            })

            if (existing.docs.length === 0) {
                const tag = await payload.create({
                    collection: 'tags',
                    data: tagData,
                })
                created.push(tag)
            } else {
                const tag = await payload.update({
                    collection: 'tags',
                    id: existing.docs[0].id,
                    data: tagData,
                })
                created.push(tag)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding tag ${tagData.slug}: ${(e as Error).message} `)
        }
    }

    console.log(`   Processed ${created.length} tags`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedPosts(payload: Payload, coachProfiles: any[], categories: any[], tags: any[]) {
    console.log('   Creating/Updating posts...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []

    for (let i = 0; i < postsData.length; i++) {
        const postData = postsData[i]
        const author = coachProfiles[i % coachProfiles.length]
        const category = categories.find(c => c.slug === postData.categorySlug)
        const postTags = tags.filter(t => postData.tagSlugs.includes(t.slug))

        try {
            const existing = await payload.find({
                collection: 'posts',
                where: { slug: { equals: postData.slug } },
                limit: 1,
            })

            const data = {
                title: postData.title,
                slug: postData.slug,
                author: author.id,
                excerpt: postData.excerpt,
                content: createRichText(postData.content),
                category: category?.id,
                tags: postTags.map(t => t.id),
                accessLevel: postData.accessLevel,
                axisLevel: postData.accessLevel,
                isPublished: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                publishedAt: existing.docs.length > 0 ? (existing.docs[0] as any).publishedAt : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                seo: {
                    metaTitle: postData.title,
                    metaDescription: postData.excerpt,
                },
            }

            if (existing.docs.length === 0) {
                const post = await payload.create({
                    collection: 'posts',
                    data,
                })
                created.push(post)
            } else {
                const post = await payload.update({
                    collection: 'posts',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(post)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding post ${postData.slug}: ${(e as Error).message} `)
        }
    }

    console.log(`   Processed ${created.length} posts`)
    return created
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedPages(payload: Payload, adminUser: any) {
    console.log('   Creating/Updating pages...')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created: any[] = []
    const authorId = adminUser?.id

    for (const pageData of pagesData) {
        try {
            const existing = await payload.find({
                collection: 'pages',
                where: { slug: { equals: pageData.slug } },
                limit: 1,
            })

            const data = {
                title: pageData.title,
                slug: pageData.slug,
                author: {
                    relationTo: 'users' as const,
                    value: authorId,
                },
                content: createRichText(pageData.content),
                isPublished: true,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                publishedAt: existing.docs.length > 0 ? (existing.docs[0] as any).publishedAt : new Date().toISOString(),
                seo: {
                    metaTitle: `${pageData.title} | Pathway`,
                    metaDescription: pageData.content.substring(0, 160),
                },
            }

            if (existing.docs.length === 0) {
                const page = await payload.create({
                    collection: 'pages',
                    data,
                })
                created.push(page)
            } else {
                const page = await payload.update({
                    collection: 'pages',
                    id: existing.docs[0].id,
                    data,
                })
                created.push(page)
            }
        } catch (e) {
            console.log(`   ⚠️ Error seeding page ${pageData.slug}: ${(e as Error).message} `)
        }
    }

    console.log(`   Processed ${created.length} pages`)
    return created
}
