import type { Meta, StoryObj } from '@storybook/react'
import { StatusCard } from './StatusCard'

const meta: Meta<typeof StatusCard> = {
  title: 'UI/StatusCard',
  component: StatusCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['blue', 'green', 'red', 'purple', 'yellow'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: '本周精选',
    value: 25,
    description: '已筛选的优质项目',
    color: 'blue',
  },
}

export const WithIcon: Story = {
  args: {
    title: '成功发布',
    value: 18,
    description: '已成功发布到各平台',
    color: 'green',
    icon: '✅',
  },
}

export const ErrorState: Story = {
  args: {
    title: '发布失败', 
    value: 3,
    description: '需要重新处理',
    color: 'red',
    icon: '❌',
  },
}

export const LargeNumber: Story = {
  args: {
    title: 'GitHub Stars',
    value: '125.6K',
    description: '项目总星标数',
    color: 'purple',
    icon: '⭐',
  },
}

export const InProgress: Story = {
  args: {
    title: '处理中',
    value: 7,
    description: '正在生成内容',
    color: 'yellow',
    icon: '🔄',
  },
}

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <StatusCard
        title="蓝色主题"
        value={42}
        description="默认颜色"
        color="blue"
        icon="📊"
      />
      <StatusCard
        title="绿色主题"
        value={38}
        description="成功状态"
        color="green"
        icon="✅"
      />
      <StatusCard
        title="红色主题"
        value={5}
        description="错误状态"
        color="red"
        icon="❌"
      />
      <StatusCard
        title="紫色主题"
        value={156}
        description="特殊状态"
        color="purple"
        icon="🚀"
      />
    </div>
  ),
}

export const ResponsiveLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
      <StatusCard
        title="移动端适配"
        value={100}
        description="响应式设计测试"
        color="blue"
      />
      <StatusCard
        title="平板适配"
        value={95}
        description="中等屏幕测试"
        color="green"
      />
      <StatusCard
        title="桌面适配"
        value={98}
        description="大屏幕测试"
        color="purple"
      />
      <StatusCard
        title="超宽屏"
        value={92}
        description="4K显示器测试"
        color="yellow"
      />
    </div>
  ),
}