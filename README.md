# Instructor SaaS

A full-stack driving instructor / ADI management platform built with modern technologies. Includes design system, component library, API backend, and multiple frontend applications.

## 🏗️ Architecture

This is a **pnpm monorepo** powered by Turborepo:

```
instructor-saas/
├── packages/
│   ├── shared/        # Zod schemas and TypeScript types
│   ├── theme/         # Design tokens, semantic tokens, component styles
│   ├── ui/            # React component library
│   └── storybook/     # Component documentation
├── apps/
│   ├── api/           # NestJS REST API (MongoDB + Stripe)
│   ├── instructor/    # Instructor dashboard (Next.js)
│   ├── learner/       # Learner portal (Next.js)
│   └── playground/    # Component demo application
└── turbo.json         # Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd instructor-saas

# Install dependencies
pnpm install

# Build shared packages
pnpm build --filter=@acme/shared --filter=@acme/theme --filter=@acme/ui
```

### Environment Setup

Create `.env` files for each app:

**apps/api/.env**
```env
MONGODB_URI=mongodb://localhost:27017/instructor-saas
JWT_SECRET=your-super-secret-jwt-key-change-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORT=3001
```

**apps/instructor/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**apps/learner/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Running the Applications

```bash
# Start all applications in development mode
pnpm dev

# Or start individually:
pnpm dev --filter=@acme/api          # API on http://localhost:3001
pnpm dev --filter=@acme/instructor   # Instructor on http://localhost:3000
pnpm dev --filter=@acme/learner      # Learner on http://localhost:3002
pnpm dev --filter=@acme/storybook    # Storybook on http://localhost:6006
```

### Seed Database

```bash
# Seed the database with demo data
pnpm --filter=@acme/api seed
```

This creates:
- Demo instructor: `instructor@example.com` / `password123`
- 3 demo learners with varying balances
- 10 lessons (past, current, and future)

## 📦 Packages

### `@acme/shared`
Shared Zod schemas and TypeScript types:
- Entity schemas: Instructor, Learner, Lesson, Payment, Package, Availability
- Auth schemas: Login, Signup, Magic Link
- Query helpers: Pagination, filtering
- Dashboard stats type

### `@acme/theme`
Design tokens and Chakra UI theme configuration:
- **Color Tokens**: Brand (teal), accent, success, warning, danger, gray scales
- **Semantic Tokens**: Context-aware colors with light/dark mode support
- **Component Styles**: Pre-configured styles for all Chakra components

### `@acme/ui`
React component library wrapping Chakra UI:

| Category | Components |
|----------|------------|
| **Foundation** | `AppProvider`, `ColorModeToggle`, `Icon`, `AppLink` |
| **Layout** | `AppShell`, `PageHeader`, `Card`, `EmptyState` |
| **Actions** | `Button` (with variants, tones, sizes) |
| **Forms** | `FormField`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `DatePickerField`, `TimePickerField`, `Stepper` |
| **Feedback** | `useToast`, `AlertBanner`, `ConfirmDialog`, `Skeleton` presets |
| **Data Display** | `DataTable`, `StatusBadge`, `MetricCard`, `TimelineItem` |
| **Scheduling** | `CalendarShell`, `BookingSlot`, `ScheduleList`, `LessonCard`, `WeekCalendar` |

### `@acme/storybook`
Component documentation with Storybook v8:
- Interactive component explorer
- Dark/light mode toggle
- Accessibility testing (addon-a11y)

## 📱 Applications

### API (`apps/api`)
NestJS REST API with:
- **Auth**: JWT authentication, bcrypt password hashing
- **Instructors**: Profile management
- **Learners**: CRUD with search and pagination
- **Lessons**: Scheduling, status management, statistics
- **Payments**: Stripe PaymentIntent integration, webhooks
- **Availability**: Weekly schedule, date overrides
- **Packages**: Lesson bundles (5, 10, 20 lessons)

### Instructor Dashboard (`apps/instructor`)
Next.js application for instructors:
- **Login**: Email/password authentication
- **Dashboard**: Stats overview, upcoming lessons
- **Calendar**: Week view with lesson events
- **Learners**: List, search, profiles, balance management

### Learner Portal (`apps/learner`)
Next.js application for learners:
- **Magic Link Auth**: Passwordless sign-in
- **Home**: Next lesson, balance, quick actions
- **Pay**: Stripe payment form for balance settlement
- **History**: Past lessons and payment records

### Playground (`apps/playground`)
Next.js demo showcasing components and design system
- **Lessons**: Calendar view with schedule management
- **Payments**: Payment history and invoicing

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run Storybook (component development)
pnpm storybook

# Run playground app (full demo)
pnpm playground

# Run both in parallel
pnpm dev
```

### Build

```bash
# Build all packages
pnpm build

# Build Storybook static site
pnpm storybook:build
```

### Quality

```bash
# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Format code
pnpm format
```

## 🎨 Theme Customization

### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `brand.500` | `#13C2C2` | `#13C2C2` | Primary actions, links |
| `accent.500` | `#1890FF` | `#1890FF` | Secondary highlights |
| `success.500` | `#52C41A` | `#73D13D` | Positive states |
| `warning.500` | `#FAAD14` | `#FFC53D` | Cautionary states |
| `danger.500` | `#FF4D4F` | `#FF7875` | Destructive actions |

### Semantic Tokens

```tsx
// Background colors
bg.canvas     // Page background
bg.surface    // Card backgrounds
bg.subtle     // Hover states

// Foreground colors
fg.default    // Primary text
fg.muted      // Secondary text
fg.subtle     // Disabled text

// Borders
border.default
border.subtle
```

### Using the Theme

```tsx
import { AppProvider } from "@acme/ui";

function App() {
  return (
    <AppProvider>
      {/* Your app */}
    </AppProvider>
  );
}
```

## 📖 Component Usage

### Button

```tsx
import { Button } from "@acme/ui";
import { Plus } from "lucide-react";

<Button variant="solid" tone="primary" leftIcon={Plus}>
  Add Learner
</Button>

<Button variant="outline" tone="danger">
  Cancel
</Button>
```

### Form Fields

```tsx
import { FormField, TextInput, Select } from "@acme/ui";

<FormField label="Email" isRequired helperText="We'll never share your email">
  <TextInput type="email" placeholder="john@example.com" />
</FormField>

<FormField label="Lesson Type">
  <Select>
    <option value="standard">Standard (1 hour)</option>
    <option value="extended">Extended (2 hours)</option>
  </Select>
</FormField>
```

### Data Table

```tsx
import { DataTable, StatusBadge } from "@acme/ui";

const columns = [
  { id: "name", header: "Name", accessor: (row) => row.name },
  { id: "status", header: "Status", accessor: (row) => <StatusBadge status={row.status} /> },
];

<DataTable
  columns={columns}
  data={learners}
  keyAccessor={(row) => row.id}
  onRowClick={(row) => console.log(row)}
/>
```

### AppShell (Layout)

```tsx
import { AppShell, PageHeader } from "@acme/ui";
import { LayoutDashboard, Users, Calendar } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Learners", icon: Users, href: "/learners" },
  { label: "Lessons", icon: Calendar, href: "/lessons" },
];

<AppShell
  logo={<Text fontWeight="bold">InstructorHub</Text>}
  navItems={navItems}
  activeHref="/"
  onNavigate={(href) => router.push(href)}
>
  <PageHeader title="Dashboard" description="Welcome back!" />
  {/* Page content */}
</AppShell>
```

## 📝 Versioning & Releases

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

```bash
# Create a changeset for your changes
pnpm changeset

# Apply changesets and update versions
pnpm version-packages

# Build and publish packages
pnpm release
```

## 🔧 Tooling

- **TypeScript**: Strict mode, bundler resolution
- **ESLint**: TypeScript + React rules
- **Prettier**: Consistent code formatting
- **tsup**: Fast TypeScript bundler with tree-shaking
- **Turborepo**: Monorepo build orchestration

## 📄 License

MIT © Instructor SaaS
