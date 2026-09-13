# Client Feature Implementation

## 1. Global Application Layout

### Top Navigation Bar

-   Simple website banner

### Side Navigation Bar

-   User profile page
-   Inbox page
-   User search
-   Current active friends list
-   Logout button

------------------------------------------------------------------------

# 2. Authentication

## Register Page

-   User registration

## Login Page

Support the following login methods: - Local login - GitHub OAuth
login - Guest login

## Continuous Authentication

-   Restore an existing authenticated session when the application loads
-   Refresh authentication when required
-   Maintain the authenticated user's state on the client

## Authentication Protection

-   Protect authenticated pages/features
-   If no authenticated user is found, redirect the user to the login
    page
-   After successful login, redirect the user to the feed page

------------------------------------------------------------------------

# 3. Feed Page

## Feed Loading

-   Load posts from the server
-   Paginate post loading
-   Continue loading posts as the user reaches the end of the feed

## Create New Post

-   Enable creation of new posts
-   Support text content
-   Support photo uploads
-   Enable/configure `multer`-related photo upload functionality on the
    client/server integration

## Post Engagement Dialog

When a user chooses to engage with a post, open a focused post dialog.

### Post Data Strategy

> **Development note:** Currently, engaging with a post redundantly
> fetches the post data again.

Possible approaches:

**Option A --- Client-side truncation** - Restrict the post content
displayed in the feed to a character limit - Only fetch the full post
when the user opens the engagement dialog

**Option B --- Reuse existing post data** - Display the post content
normally in the feed - Remove the redundant post fetch when opening the
engagement dialog - Pass/migrate the existing post data into the
engagement dialog

**Preferred direction:** Avoid redundant network requests when the
required post data is already available on the client.

### Post Interactions

Interactions depend on the relationship between the current viewer and
the post author.

#### Post Author

-   Edit post
-   Delete post

#### Other Viewers

-   Like post
-   Dislike post

### Full Post

-   Load/display the full post when required

------------------------------------------------------------------------

# 4. Comments

## Comment Loading

-   Load comments for the selected post
-   Paginate comments

## Comment Interactions

Interactions depend on the relationship between the current viewer and
the comment author.

### Comment Author

-   Edit comment
-   Delete comment

### Other Viewers

-   Like comment
-   Dislike comment

## Create Comment

-   Enable creation of new comments

## Comment State / Data Fetching Strategy

> **Development note:** Comment interactions should avoid unnecessarily
> refetching all comments.

When interacting with an individual comment: - Fetch only the affected
comment by ID when fresh server data is required - Replace the existing
comment in client state with the updated comment - Avoid refetching the
entire comment list

Example state update concept:

``` js
setComments(prev =>
  prev.map(comment =>
    comment.id === updatedComment.id
      ? updatedComment
      : comment
  )
)
```

------------------------------------------------------------------------

# 5. User Profile Page

## User Data

-   Fetch the user's profile data from the server
-   If the profile is private, respect the server's visibility rules
-   Allow the current user to access their own `/me` data
-   Populate the profile page with the returned user data

## User Post History

-   Load the user's posts
-   Paginate the user's post history/feed

## Profile Editing

-   Enable editing of user data

## Friendships

-   Display a simplified side list of the user's current active
    friendships

## Create Post

-   Allow the user to create a post directly from their profile page

------------------------------------------------------------------------

# 6. Search Page

## Search

-   Provide a simple search bar
-   Search for users

## Search Results

-   Display search results
-   Paginate search results

------------------------------------------------------------------------

# 7. Inbox Page

## Friendship Requests

-   Display connections/friendships with `PENDING` status
-   Include both:
    -   Sent requests
    -   Received requests

## Request Actions

-   Accept friendship request
-   Reject friendship request

------------------------------------------------------------------------

# 8. Friends Page

## Active Friendships

-   Fetch friendships/connections with `ACTIVE` status
-   Display the user's current friends

## Friendship Actions

-   Block friendship
-   Deactivate/remove friendship

------------------------------------------------------------------------

# 9. Suggested Implementation Order

To keep client-side development organized, implement the features in
dependency order rather than strictly by page.

### Phase 1 --- Application Foundation

-   [x] App layout
-   [x] Top navigation
-   [x] Side navigation
-   [x] Routing
-   [x] Global authentication state
-   [x] Continuous authentication
-   [x] Authentication protection

### Phase 2 --- Authentication

-   [ ] Register
-   [ ] Local login
-   [x] GitHub login
-   [ ] Guest login
-   [x] Logout
-   [x] Redirect authenticated users to feed

### Phase 3 --- Feed

-   [x] Initial feed loading
-   [x] Post pagination
-   [x] Post rendering
-   [ ] Create post
-   [ ] Photo upload
-   [x] Post engagement dialog
-   [ ] Post edit/delete
-   [x] Post like/dislike

### Phase 4 --- Comments

-   [x] Comment loading
-   [x] Comment pagination
-   [ ] Create comment
-   [ ] Comment edit/delete
-   [x] Comment like/dislike
-   [ ] Efficient individual-comment updates

### Phase 5 --- User Profile

-   [ ] User profile loading
-   [ ] Private-profile handling
-   [ ] `/me` handling
-   [ ] User post history
-   [ ] Post pagination
-   [ ] Profile editing
-   [ ] Friend sidebar
-   [ ] Create post from profile

### Phase 6 --- Social Features

-   [ ] User search
-   [ ] Search pagination
-   [ ] Inbox
-   [ ] Accept/reject requests
-   [ ] Friends list
-   [ ] Block/deactivate friendship

### Phase 7 --- UX / Cleanup

-   [ ] Loading states
-   [ ] Error states
-   [ ] Empty states
-   [ ] Dialog cleanup
-   [ ] Prevent redundant API requests
-   [ ] Verify authentication edge cases
-   [ ] Verify pagination edge cases
-   [ ] Verify permissions based on author/viewer relationship
