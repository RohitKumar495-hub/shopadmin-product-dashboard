# ShopAdmin — Product Admin Dashboard

A modern, responsive Product Admin Dashboard built with **Next.js, React, TypeScript, Tailwind CSS and Axios**, using the free **DummyJSON API** for authentication and product data.

The project was developed as part of a frontend development assignment focused on authentication, product management, search, filtering, sorting, pagination, responsive UI and API handling.

---

## 🚀 Live Demo

Coming soon — Vercel deployment.

---

## 📦 GitHub Repository

https://github.com/RohitKumar495-hub/shopadmin-product-dashboard

---

## ✨ Features

### 🔐 Authentication

- Login using the DummyJSON authentication API
- Demo credentials:
  - Username: `emilys`
  - Password: `emilyspass`
- Login error handling for invalid credentials
- Protected product routes
- Logout functionality
- Remember Me support
- Authentication token stored on the client
- Authentication token automatically attached to API requests
- Centralized `401 Unauthorized` handling
- Automatic redirect to login when the session becomes unauthorized
- Duplicate login requests prevented

### 📦 Product Management

- Product listing
- Desktop table layout
- Mobile card layout
- Product image
- Product title
- Product category
- Product price
- Product rating
- Product stock
- Product details page
- Product image gallery
- Product description
- Product reviews
- Add product
- Edit product
- Delete product
- Delete confirmation popup
- Form validation
- Success and error toast notifications

### 🔎 Search, Filter & Sort

- Product search using the DummyJSON search API
- Debounced search
- Pagination resets when the search query changes
- Category filtering
- Sorting by:
  - Price
  - Rating
  - Title
- Search, filter, sort and pagination state maintained through URL parameters
- Invalid URL parameters handled safely

### 📄 Pagination

- API-based pagination using `limit` and `skip`
- Page numbers
- Previous button
- Next button
- Page size options:
  - 10
  - 20
  - 50
- Result information such as:

```text
Showing 21–40 of 194
```

### ⚡ Loading, Empty & Error States

The application handles:

- Loading states while fetching data
- Empty search results
- Empty product lists
- API errors
- Retry functionality
- Invalid product IDs
- Invalid URL parameters
- Duplicate Save requests
- Duplicate Login requests

### 📱 Responsive Design

The dashboard is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

The product list uses a table on larger screens and responsive cards on smaller screens.

The sidebar also includes responsive mobile navigation.

---

# 🛠️ Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Axios**
- **Lucide React**
- **Sonner**
- **DummyJSON API**

---

# 📁 Project Structure

```text
src/
├── app/
│   ├── login/
│   │   └── page.tsx
│   │
│   ├── products/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx
│   │
│   ├── dashboard/
│   │   ├── DashboardShell.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   │
│   └── products/
│       └── ProductForm.tsx
│
├── hooks/
│   └── useDebounce.ts
│
├── lib/
│   └── axios.ts
│
├── services/
│   ├── auth.service.ts
│   └── product.service.ts
│
└── types/
    └── product.ts
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

You can verify the installations using:

```bash
node -v
npm -v
git --version
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/RohitKumar495-hub/shopadmin-product-dashboard.git
```

---

## 2. Navigate to the Project

```bash
cd shopadmin-product-dashboard
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a file named:

```text
.env.local
```

in the root directory of the project.

Add:

```env
NEXT_PUBLIC_API_BASE_URL=https://dummyjson.com
```

The `.env.local` file should not be committed to GitHub.

---

## 5. Start the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## 6. Run Lint

```bash
npm run lint
```

---

## 7. Create a Production Build

```bash
npm run build
```

---

## 8. Start the Production Server

```bash
npm start
```

The production application will be available at:

```text
http://localhost:3000
```

---

# 🔐 Demo Credentials

The assignment uses DummyJSON authentication.

Use:

```text
Username: emilys
Password: emilyspass
```

The login form sends the credentials to:

```text
POST /auth/login
```

The application does not hardcode successful login behavior. The credentials are validated through the API.

---

# 🔌 API Integration

All API requests are made using **Axios**.

A shared Axios instance is located at:

```text
src/lib/axios.ts
```

The Axios configuration:

- Uses the API base URL from the environment variable
- Automatically attaches the authentication token
- Handles API errors centrally
- Redirects to the login page when a `401 Unauthorized` response is received

API calls are kept inside dedicated service files rather than directly inside UI components.

```text
src/services/auth.service.ts
src/services/product.service.ts
```

---

# 📡 API Endpoints Used

## Authentication

```text
POST /auth/login
```

## Product List

```text
GET /products
```

## Product Search

```text
GET /products/search?q=
```

## Categories

The DummyJSON category-list endpoint used by the application is:

```text
GET /products/category-list
```

## Products by Category

```text
GET /products/category/{category}
```

## Product Details

```text
GET /products/{id}
```

## Add Product

```text
POST /products/add
```

## Update Product

```text
PUT /products/{id}
```

## Delete Product

```text
DELETE /products/{id}
```

---

# 🧠 Important Implementation Decisions

## Search and Category Filtering

The DummyJSON API does not support searching products and filtering by category in the same request.

Because of this limitation, the application treats search and category filtering as separate modes.

When searching, the application uses:

```text
/products/search?q=
```

When category filtering is active, the application uses:

```text
/products/category/{category}
```

This avoids sending incompatible API requests and keeps the result behavior predictable.

---

# 📄 Pagination Approach

Pagination is handled using the API's:

```text
limit
skip
```

parameters.

For example:

```text
/products?limit=10&skip=20
```

represents the third page when the page size is 10.

The UI calculates the current range and displays information such as:

```text
Showing 21–30 of 194
```

Users can also change the page size to:

```text
10
20
50
```

---

# 🔎 Search Debouncing

The search input uses a debounce mechanism.

Instead of making an API request for every keystroke, the application waits until the user stops typing for a short period before sending the request.

For example, typing:

```text
iph
iphone
iphone 15
```

does not immediately create a separate request for every character.

This reduces unnecessary API calls and improves the user experience.

---

# 🛡️ Stale Search Response Protection

A potential issue with search is that API responses may arrive in a different order than the requests were sent.

For example:

```text
Request 1 → iph
Request 2 → iphone
Request 3 → iphone 15
```

If Request 1 takes longer than Request 3, its old response should not replace the latest results.

The application handles this by cancelling/ignoring stale requests so that only the latest active search can update the UI.

This can be tested using an artificial API delay such as:

```text
&delay=2000
```

---

# 🔄 Add, Edit and Delete Behavior

DummyJSON provides endpoints for adding, updating and deleting products, but these mutations are not permanently persisted by the API.

Because of this, the application updates its local UI state after a successful mutation.

For example:

1. User adds a product.
2. API returns a successful response.
3. The product is added to the application's current product state.
4. The new product immediately appears in the UI.

The same approach is used for editing and deleting products.

A page refresh may restore the original DummyJSON dataset because the API does not permanently persist these changes.

---

# 🔗 URL State

The application keeps important product-list state in the URL.

This includes values such as:

```text
page
search
category
sort
page size
```

This allows users to:

- Refresh the page without losing the current state
- Share a product-list URL
- Navigate using browser history

Invalid values are handled safely.

For example:

```text
?page=abc
```

or:

```text
?page=999
```

will not cause the application to crash.

---

# 🔐 Protected Routes

Product pages are protected using an authentication guard.

The protected product layout checks whether an authentication token exists before displaying the product dashboard.

Unauthenticated users are redirected to:

```text
/login
```

API-level `401` responses are also handled centrally through Axios.

---

# 🧾 Form Validation

The Add/Edit Product form validates:

- Product title
- Description
- Category
- Price
- Stock

Price must be:

```text
0 or greater
```

Stock must be:

```text
a whole number 0 or greater
```

The form also prevents duplicate Save requests while a request is already in progress.

---

# 🗑️ Delete Confirmation

Deleting a product requires confirmation before the API request is made.

This prevents accidental product deletion.

After a successful deletion:

- The product is removed from the UI
- A success toast is displayed

If the request fails:

- The product remains available
- An error toast is displayed

---

# 🔔 Notifications

The application uses **Sonner** for toast notifications.

Notifications are used for actions such as:

- Successful login
- Failed login
- Successful product creation
- Successful product update
- Successful product deletion
- Failed product operations
- Successful logout

---

# 📱 Responsive UI

The dashboard adapts its layout based on screen size.

### Desktop

Products are displayed using a structured table containing:

- Product
- Category
- Price
- Rating
- Stock
- Actions

### Mobile

Products are displayed as cards for better readability and touch interaction.

The sidebar also changes into a mobile navigation drawer.

---

# 🎨 UI & Design

The application follows a clean SaaS-style admin dashboard design.

The design uses:

- Light neutral background
- Dark sidebar
- Indigo primary color
- White content surfaces
- Subtle borders and shadows
- Consistent spacing
- Responsive typography
- Status badges
- Toast notifications
- Confirmation dialogs

The goal was to keep the interface modern and professional without adding unnecessary visual elements.

---

# 🐛 Problem Faced & Solution

## Problem: Stale Search Results

One of the main technical challenges was handling multiple search requests when users type quickly.

For example:

```text
iph
iphone
iphone 15
```

A previous request could potentially finish after the latest request and overwrite the latest search results.

### Solution

The application uses debouncing together with request cancellation/stale-response protection.

When a newer search becomes active, an older request is prevented from updating the UI.

This ensures that the displayed results always correspond to the latest search query.

---

# ⚠️ Another Edge Case: Leading Zeros

While implementing the Add/Edit Product form, numeric inputs initially stored values directly as JavaScript numbers.

This could result in undesirable input behavior when entering values such as:

```text
090
```

The form was updated to keep the editable numeric input as a string while the user is typing.

Leading zeros are normalized so that:

```text
090 → 90
0050 → 50
```

The value is converted back to a number when the form is submitted.

This keeps the input behavior user-friendly while maintaining the correct numeric API payload.

---

# 🤖 AI Assistance

AI tools were used during development for:

- Debugging implementation issues
- Reviewing implementation approaches
- Improving UI/UX decisions
- Identifying edge cases
- Refining error handling
- Reviewing component structure
- Troubleshooting API and React issues

AI suggestions were reviewed, tested and integrated manually.

The final implementation was understood and verified before submission.

---

# 📋 Assignment Completion

| Requirement | Status |
|---|:---:|
| Login page | ✅ |
| DummyJSON authentication | ✅ |
| Wrong credential handling | ✅ |
| Protected product pages | ✅ |
| Logout | ✅ |
| Product listing | ✅ |
| Desktop table | ✅ |
| Mobile cards | ✅ |
| Product image | ✅ |
| Product title | ✅ |
| Product category | ✅ |
| Product price | ✅ |
| Product rating | ✅ |
| Product stock | ✅ |
| Pagination | ✅ |
| Page numbers | ✅ |
| Previous / Next | ✅ |
| Page size 10 / 20 / 50 | ✅ |
| Result count | ✅ |
| Product search | ✅ |
| Search debouncing | ✅ |
| Category filtering | ✅ |
| Sorting | ✅ |
| URL state | ✅ |
| Product details | ✅ |
| Product reviews | ✅ |
| Invalid product handling | ✅ |
| Add product | ✅ |
| Edit product | ✅ |
| Delete product | ✅ |
| Delete confirmation | ✅ |
| Form validation | ✅ |
| Loading states | ✅ |
| Empty states | ✅ |
| Error states | ✅ |
| Retry functionality | ✅ |
| Stale search protection | ✅ |
| Duplicate request prevention | ✅ |
| Responsive design | ✅ |

---

# 📌 Future Improvements

Possible future improvements include:

- Persistent backend/database for product mutations
- Role-based access control
- Advanced analytics dashboard
- Product image upload
- Bulk product operations
- Server-side persistence for user-created products
- More advanced filtering

These are outside the scope of the current assignment.

---

# 📄 Assignment

This project was developed as part of a frontend development assignment.

The application uses the free DummyJSON API for authentication and product data and implements the required product management functionality with a responsive user interface.

---

## 👨‍💻 Author

**Rohit Kumar**

GitHub:

https://github.com/RohitKumar495-hub
