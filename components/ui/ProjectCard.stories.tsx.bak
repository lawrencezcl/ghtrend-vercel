import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { ProjectCard } from './ProjectCard'

const meta: Meta<typeof ProjectCard> = {
  title: 'UI/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['draft', 'generated', 'ready', 'published', 'failed'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    repoId: 'microsoft/typescript',
    title: 'TypeScript Programming Language',
    description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    stars: 95000,
    score: 87.5,
    topics: ['typescript', 'javascript', 'compiler', 'language'],
    status: 'published',
    date: '2024-09-24',
    onViewRepo: action('view-repo'),
    onRetry: action('retry'),
  },
}

export const Draft: Story = {
  args: {
    repoId: 'vercel/next.js',
    title: 'The React Framework for Production',
    description: 'Next.js gives you the best developer experience with all the features you need for production.',
    stars: 110000,
    score: 92.3,
    topics: ['react', 'nextjs', 'framework', 'javascript', 'web'],
    status: 'draft',
    date: '2024-09-24',
    onViewRepo: action('view-repo'),
  },
}

export const Failed: Story = {
  args: {
    repoId: 'facebook/react',
    title: 'React JavaScript Library',
    description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
    stars: 210000,
    score: 89.1,
    topics: ['react', 'javascript', 'library', 'ui'],
    status: 'failed',
    date: '2024-09-24',
    onViewRepo: action('view-repo'),
    onRetry: action('retry'),
  },
}

export const WithoutOptionalFields: Story = {
  args: {
    repoId: 'rust-lang/rust',
    stars: 80000,
    status: 'ready',
    date: '2024-09-24',
    onViewRepo: action('view-repo'),
  },
}

export const LongContent: Story = {
  args: {
    repoId: 'tensorflow/tensorflow',
    title: 'An Open Source Machine Learning Framework for Everyone That Makes It Easy to Build and Deploy Models',
    description: 'TensorFlow is an end-to-end open source platform for machine learning. It has a comprehensive, flexible ecosystem of tools, libraries and community resources that lets researchers push the state-of-the-art in ML and developers easily build and deploy ML powered applications.',
    stars: 175000,
    score: 95.8,
    topics: ['machine-learning', 'deep-learning', 'neural-networks', 'tensorflow', 'python', 'artificial-intelligence', 'data-science', 'ml'],
    status: 'published',
    date: '2024-09-24',
    onViewRepo: action('view-repo'),
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="grid gap-4 max-w-2xl">
      <ProjectCard
        repoId="example/draft-project"
        title="草稿状态项目"
        description="这是一个处于草稿状态的项目"
        stars={1200}
        score={65.4}
        topics={['javascript', 'draft']}
        status="draft"
        date="2024-09-24"
        onViewRepo={action('view-repo')}
      />
      <ProjectCard
        repoId="example/generated-project"
        title="已生成内容项目"
        description="内容已生成，等待渲染"
        stars={3400}
        score={72.1}
        topics={['typescript', 'generated']}
        status="generated"
        date="2024-09-24"
        onViewRepo={action('view-repo')}
      />
      <ProjectCard
        repoId="example/ready-project"
        title="准备发布项目"
        description="准备发布到各个平台"
        stars={5600}
        score={78.9}
        topics={['react', 'ready']}
        status="ready"
        date="2024-09-24"
        onViewRepo={action('view-repo')}
      />
      <ProjectCard
        repoId="example/published-project"
        title="已发布项目"
        description="已成功发布到所有平台"
        stars={12000}
        score={85.7}
        topics={['vue', 'published']}
        status="published"
        date="2024-09-24"
        onViewRepo={action('view-repo')}
      />
      <ProjectCard
        repoId="example/failed-project"
        title="发布失败项目"
        description="发布过程中出现错误"
        stars={2800}
        score={69.3}
        topics={['angular', 'failed']}
        status="failed"
        date="2024-09-24"
        onViewRepo={action('view-repo')}
        onRetry={action('retry')}
      />
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const handleViewRepo = (repoId: string) => {
      window.open(`https://github.com/${repoId}`, '_blank')
    }
    
    return (
      <div className="grid gap-4 max-w-xl">
        <ProjectCard
          repoId="microsoft/vscode"
          title="Visual Studio Code"
          description="A lightweight but powerful source code editor"
          stars={145000}
          score={91.2}
          topics={['editor', 'typescript', 'electron']}
          status="published"
          date="2024-09-24"
          onViewRepo={() => handleViewRepo('microsoft/vscode')}
        />
        <ProjectCard
          repoId="openai/whisper"
          title="Whisper Speech Recognition"
          description="Robust Speech Recognition via Large-Scale Weak Supervision"
          stars={55000}
          score={88.7}
          topics={['ai', 'speech-recognition', 'machine-learning']}
          status="failed"
          date="2024-09-24"
          onViewRepo={() => handleViewRepo('openai/whisper')}
          onRetry={() => alert('重试发布...')}
        />
      </div>
    )
  },
}