# Modal Components

A standardized set of reusable modal components for consistent modal usage across the Offer Hub application.

## Components

### 1. Base Modal (`Modal`)

A flexible base modal component that provides consistent behavior and styling.

#### Features

- Responsive sizing (sm, md, lg, xl, full)
- Keyboard navigation (ESC to close)
- Click outside to close
- Accessible close button
- Dark mode support
- Customizable header, content, and footer

#### Usage

```tsx
import { Modal } from "@/components/modals";

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  description="Modal description"
  size="md"
>
  <p>Modal content here</p>
</Modal>;
```

#### Props

| Prop                  | Type                                     | Default | Description                                     |
| --------------------- | ---------------------------------------- | ------- | ----------------------------------------------- |
| `isOpen`              | `boolean`                                | -       | Whether the modal is open                       |
| `onClose`             | `() => void`                             | -       | Function to call when modal should be closed    |
| `title`               | `string`                                 | -       | Modal title                                     |
| `description`         | `string`                                 | -       | Modal description                               |
| `children`            | `React.ReactNode`                        | -       | Modal content                                   |
| `className`           | `string`                                 | -       | Additional CSS classes                          |
| `size`                | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"`  | Size variant                                    |
| `showCloseButton`     | `boolean`                                | `true`  | Whether to show the close button                |
| `closeOnOverlayClick` | `boolean`                                | `true`  | Whether clicking outside should close the modal |
| `closeOnEscape`       | `boolean`                                | `true`  | Whether pressing Escape should close the modal  |
| `footer`              | `React.ReactNode`                        | -       | Custom footer content                           |

### 2. Confirmation Modal (`ConfirmationModal`)

A specialized modal for confirming actions with different types and visual indicators.

#### Features

- Multiple types: warning, danger, info, success
- Visual icons and colors for each type
- Loading states
- Consistent button styling
- Accessible design

#### Usage

```tsx
import { ConfirmationModal } from "@/components/modals";

<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  type="danger"
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  confirmText="Delete"
  cancelText="Cancel"
  isLoading={isLoading}
/>;
```

#### Props

| Prop          | Type                                           | Default                               | Description                                    |
| ------------- | ---------------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| `isOpen`      | `boolean`                                      | -                                     | Whether the modal is open                      |
| `onClose`     | `() => void`                                   | -                                     | Function to call when modal should be closed   |
| `onConfirm`   | `() => void`                                   | -                                     | Function to call when user confirms the action |
| `title`       | `string`                                       | `"Confirm Action"`                    | Modal title                                    |
| `message`     | `string`                                       | `"Are you sure you want to proceed?"` | Confirmation message                           |
| `confirmText` | `string`                                       | `"Confirm"`                           | Confirm button text                            |
| `cancelText`  | `string`                                       | `"Cancel"`                            | Cancel button text                             |
| `type`        | `"warning" \| "danger" \| "info" \| "success"` | `"warning"`                           | Modal type                                     |
| `isLoading`   | `boolean`                                      | `false`                               | Whether the confirm action is loading          |
| `isDisabled`  | `boolean`                                      | `false`                               | Whether the confirm button is disabled         |
| `className`   | `string`                                       | -                                     | Additional CSS classes                         |
| `size`        | `"sm" \| "md" \| "lg"`                         | `"sm"`                                | Size of the modal                              |

#### Types

- **Warning**: Yellow theme, AlertTriangle icon
- **Danger**: Red theme, XCircle icon, destructive button variant
- **Info**: Blue theme, Info icon
- **Success**: Green theme, CheckCircle icon

### 3. Form Modal (`ModalForm`)

A modal component specifically designed for forms with built-in validation and error handling.

#### Features

- Built-in form handling
- Validation error display
- Loading states
- Form field components
- Automatic form reset on close
- Support for various input types

#### Usage

```tsx
import { ModalForm, ModalFormField } from "@/components/modals";

<ModalForm
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  title="Contact Form"
  isLoading={isLoading}
  errors={errors}
>
  <ModalFormField
    name="name"
    label="Full Name"
    placeholder="Enter your name"
    required
  />
  <ModalFormField name="email" type="email" label="Email" required />
  <ModalFormField name="message" type="textarea" label="Message" rows={4} />
</ModalForm>;
```

#### Props

| Prop               | Type                                        | Default    | Description                                  |
| ------------------ | ------------------------------------------- | ---------- | -------------------------------------------- |
| `isOpen`           | `boolean`                                   | -          | Whether the modal is open                    |
| `onClose`          | `() => void`                                | -          | Function to call when modal should be closed |
| `onSubmit`         | `(data: FormData) => void \| Promise<void>` | -          | Function to call when form is submitted      |
| `title`            | `string`                                    | -          | Modal title                                  |
| `description`      | `string`                                    | -          | Modal description                            |
| `children`         | `React.ReactNode`                           | -          | Form content                                 |
| `submitText`       | `string`                                    | `"Submit"` | Submit button text                           |
| `cancelText`       | `string`                                    | `"Cancel"` | Cancel button text                           |
| `isLoading`        | `boolean`                                   | `false`    | Whether the form is loading                  |
| `isDisabled`       | `boolean`                                   | `false`    | Whether the submit button is disabled        |
| `className`        | `string`                                    | -          | Additional CSS classes                       |
| `size`             | `"sm" \| "md" \| "lg" \| "xl" \| "full"`    | `"md"`     | Size of the modal                            |
| `showCancelButton` | `boolean`                                   | `true`     | Whether to show the cancel button            |
| `footer`           | `React.ReactNode`                           | -          | Custom footer content                        |
| `errors`           | `Record<string, string>`                    | `{}`       | Form validation errors                       |
| `resetOnClose`     | `boolean`                                   | `true`     | Whether to reset form on close               |
| `formRef`          | `React.RefObject<HTMLFormElement>`          | -          | Form ref for external control                |

### 4. Modal Form Field (`ModalFormField`)

A specialized form field component designed for use within modal forms.

#### Features

- Consistent styling with modal theme
- Built-in error display
- Support for various input types
- Accessibility features
- Dark mode support

#### Usage

```tsx
<ModalFormField
  name="fieldName"
  label="Field Label"
  type="text"
  placeholder="Enter value"
  required
  error={errors.fieldName}
/>
```

#### Props

| Prop          | Type                                    | Default  | Description               |
| ------------- | --------------------------------------- | -------- | ------------------------- |
| `name`        | `string`                                | -        | Field name                |
| `label`       | `string`                                | -        | Field label               |
| `type`        | `string`                                | `"text"` | Field type                |
| `placeholder` | `string`                                | -        | Field placeholder         |
| `value`       | `string`                                | -        | Field value               |
| `error`       | `string`                                | -        | Field error message       |
| `required`    | `boolean`                               | `false`  | Whether field is required |
| `disabled`    | `boolean`                               | `false`  | Whether field is disabled |
| `onChange`    | `(e: ChangeEvent) => void`              | -        | Field change handler      |
| `className`   | `string`                                | -        | Additional CSS classes    |
| `options`     | `Array<{value: string, label: string}>` | -        | Options for select fields |
| `rows`        | `number`                                | `3`      | Rows for textarea         |
| `description` | `string`                                | -        | Field description         |

#### Supported Types

- `text` - Text input
- `email` - Email input
- `password` - Password input
- `number` - Number input
- `textarea` - Textarea
- `select` - Select dropdown

## Demo Component

A comprehensive demo component is available at `@/components/demo/modal-demo` that showcases all modal components and their features. Use this for testing and development.

## Best Practices

1. **Consistent Sizing**: Use appropriate sizes for different use cases

   - `sm`: Simple confirmations
   - `md`: Standard forms and content
   - `lg`: Complex forms with multiple fields
   - `xl`: Detailed views or complex layouts
   - `full`: Full-screen experiences

2. **Error Handling**: Always handle errors gracefully and provide clear feedback

3. **Loading States**: Show loading states for async operations

4. **Accessibility**: All components include proper ARIA labels and keyboard navigation

5. **Dark Mode**: All components support dark mode automatically

6. **Responsive Design**: Modals are responsive and work well on all screen sizes

## Migration Guide

If you're migrating from existing modal implementations:

1. Replace custom modal implementations with the base `Modal` component
2. Use `ConfirmationModal` for any confirmation dialogs
3. Use `ModalForm` for form-based modals
4. Update imports to use the centralized exports from `@/components/modals`

## Examples

See the `ModalDemo` component for comprehensive examples of all modal types and usage patterns.
