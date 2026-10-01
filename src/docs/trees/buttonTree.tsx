import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { msAdd, msArrowForward, msShare } from '../../icons/material'
import type { ComponentTreeSpec } from '../ComponentTree'

// Button options as a tree. Rules come from src/components/Button/USAGE.md.

export const buttonTree: ComponentTreeSpec = {
  title: 'Button',
  note: '7 variants · 3 sizes · 3 states',
  branches: [
    {
      id: 'variant',
      label: 'Variant',
      note: 'What the action means',
      groups: [
        {
          id: 'g-emphasis',
          label: 'Emphasis',
          note: 'Everyday actions, strongest to quietest',
          leaves: [
            { id: 'v-primary', label: 'primary', note: 'The main action. One per screen.', preview: <Button size="md">Confirm</Button> },
            { id: 'v-secondary', label: 'secondary', note: 'Only next to a stronger button, usually in a dock.', preview: <Button size="md" variant="secondary">Cancel</Button> },
            { id: 'v-tertiary', label: 'tertiary', note: 'Stand-alone actions in content, e.g. View all.', preview: <Button size="md" variant="tertiary">View all</Button> },
            { id: 'v-ghost', label: 'ghost', note: 'Text-style action inside other components.', preview: <Button size="md" variant="ghost">Edit</Button> },
          ],
        },
        {
          id: 'g-brand',
          label: 'Brand',
          note: 'Follows the product color',
          leaves: [
            { id: 'v-brand', label: 'brand', note: 'Brand moments: onboarding, promotions.', preview: <Button size="md" variant="brand">Start</Button> },
          ],
        },
        {
          id: 'g-trade',
          label: 'Trade',
          note: 'Only to place or confirm a trade',
          leaves: [
            { id: 'v-buy', label: 'buy', note: 'Buy side.', preview: <Button size="md" variant="buy">Buy</Button> },
            { id: 'v-sell', label: 'sell', note: 'Sell side. Never a "danger" button.', preview: <Button size="md" variant="sell">Sell</Button> },
          ],
        },
      ],
    },
    {
      id: 'size',
      label: 'Size',
      note: 'Where it sits',
      leaves: [
        { id: 's-lg', label: 'lg · 48', note: 'Docks / ButtonGroup (always) and the main CTA.', preview: <Button size="lg">Continue</Button> },
        { id: 's-md', label: 'md · 40', note: 'Inside content: cards, sheet bodies, forms.', preview: <Button size="md">Continue</Button> },
        { id: 's-sm', label: 'sm · 32', note: 'Compact spots: empty states, inline rows, toolbars.', preview: <Button size="sm">Continue</Button> },
      ],
    },
    {
      id: 'state',
      label: 'State',
      note: 'What it is doing',
      leaves: [
        { id: 'st-default', label: 'default', note: 'Ready to tap.', preview: <Button size="md">Save</Button> },
        { id: 'st-loading', label: 'loading', note: 'While the action runs. Keeps its width, ignores taps.', preview: <Button size="md" loading>Save</Button> },
        { id: 'st-disabled', label: 'disabled', note: 'Only when the reason is visible nearby.', preview: <Button size="md" disabled>Save</Button> },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      note: 'Label and icons',
      leaves: [
        { id: 'c-label', label: 'label', note: 'Verb first, 1–3 words.', preview: <Button size="md" variant="tertiary">Add funds</Button> },
        { id: 'c-left', label: 'icon left + label', note: 'Icon reinforces the action.', preview: <Button size="md" variant="tertiary" iconLeft={<Icon icon={msAdd} />}>Add</Button> },
        { id: 'c-right', label: 'label + icon right', note: 'Icon shows direction.', preview: <Button size="md" variant="tertiary" iconRight={<Icon icon={msArrowForward} />}>Continue</Button> },
        { id: 'c-icon', label: 'icon only', note: 'Exactly one icon + aria-label. Never two icons without a label.', preview: <Button size="md" variant="tertiary" aria-label="Share" iconLeft={<Icon icon={msShare} />} /> },
      ],
    },
  ],
}
