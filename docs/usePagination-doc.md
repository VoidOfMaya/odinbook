# `usePagination`

`usePagination` is a reusable React custom hook for handling cursor based pagination utilizing `IntersectionObserver` as a trigger for infinite scroll

It abstracts away the repetitive logic required to:

* Fetch the initial page of data.
* Fetch subsequent pages using a cursor.
* Accumulate paginated results into a single data array.
* Track whether more data is available.
* Track whether a request is currently in progress.
* Automatically request the next page when a designated element enters the viewport.
* Manage the `IntersectionObserver` lifecycle.

---

## Basic Usage

The hook requires a callback function responsible for fetching the data.

```js
const {
    data,
    updateData,
    cursor,
    hasMore,
    loadData,
    contextRef,
    lastRecordRef
} = usePagination(fetchData, boolenableValue);
```

The returned values can then be used by the consuming component.

```jsx
<div ref={contextRef}>

    {data.map(post => (
        <Post
            key={post.id}
            post={post}
        />
    ))}

    <div ref={lastRecordRef} />

    {loadData && <p>Loading...</p>}

</div>
```

---

# Fetch Callback

The hook requires a callback function that handles communication with the API.

The callback should accept a cursor and return an object containing:

```js
{
    data: [],
    nextCursor: "...",
    hasMore: true
}
```

for this to work properly with rolling session authentication make use of the callApi function :

```js
const fetchPosts = async (cursor = null, limit = 10) => {

const response = await callApi({
                method: 'GET',
                // enables both first call and next call within the hook
                path: `feed/?limit=${limit}${cursor ? `&cursor=${cursor}`: ''}`,
                requiresAuth: true,
                token: auth.accessToken,
                retry: true,
                includeCred:true
            })

    return await response.json()
};
```

The first request is made without a cursor:

```js
fetchPosts();
```

Subsequent requests automatically receive the cursor from the previous response:

```js
fetchPosts(nextCursor);
```

The consuming component does **not** need to manually manage this cursor.

---
# Boolean Value
  by default the second argument this hook takes is true meaning it will run the hook
  on each rerender, hjowever this may not always be the desired behavior, for example
  conditionally rendered components that utilize this hook , we dont allways want to mount and start fetching data when our component has not yet become relevant
# Return Values

## `data`

```js
data
```

An array containing all data retrieved so far.

The hook automatically combines newly fetched pages with the existing data.

For example:

```text
Initial request:

data = [A, B, C]

Second request:

new data = [D, E, F]

Hook result:

data = [A, B, C, D, E, F]
```

The component therefore only needs to render `data` and does not need to keep track of individual pages.

---
## `updateData`
    is an endpoint function allowing user to pass through data 
    to update elements inside of the data state itself, this is used
    to insure a single source of truth and simplifying data updates on interactions
    without having to create a different state and trying to allways keep both in sync
    
## `cursor`

```js
cursor
```

The cursor returned by the most recent API request.

The hook uses this cursor internally when requesting the next page.

Normally, the consuming component **does not need to use ****`cursor`**** directly**.

It is exposed by the hook primarily for cases where the component may need to inspect or interact with the current pagination state.

---

## `hasMore`

```js
hasMore
```

Indicates whether additional data is available.

The value comes from the API's `hasMore` response.

For example:

```js
{
    data: [...],
    nextCursor: "abc123",
    hasMore: true
}
```

means another page is available.

When the API returns:

```js
{
    data: [...],
    nextCursor: null,
    hasMore: false
}
```

the hook stops attempting to fetch additional pages.

The consuming component can also use `hasMore` to conditionally render the pagination sentinel or an "end of feed" message.

Example:

```jsx
{hasMore && (
    <div ref={lastRecordRef} />
)}
```

Or:

```jsx
{!hasMore && <p>No more posts.</p>}
```

---

## `loadData`

```js
loadData
```

A boolean indicating whether the hook is currently fetching data.

This can be used by the component to display loading indicators.

```jsx
{loadData && <LoadingSpinner />}
```

It can also be used to prevent UI actions that should not occur while another pagination request is running.

The hook itself also uses this state to prevent the `IntersectionObserver` from repeatedly triggering additional requests while a request is already in progress.

---

## `contextRef`

```js
contextRef
```

A React ref used to define the **root element** for the `IntersectionObserver`.

Attach it to the element whose boundaries should be used when determining whether the observed element is visible.

```jsx
<div ref={contextRef}>
    ...
</div>
```

For example, if the feed has its own scrollable container:

```jsx
<div
    ref={contextRef}
    className="feedContainer"
>
    ...
</div>
```

The observer will then determine intersection relative to this container rather than the browser viewport.

If no custom root is required, the root can be `null`, which causes the observer to use the browser viewport.

---

## `lastRecordRef`

```js
lastRecordRef
```

A React callback ref used to identify the element that should trigger loading of the next page.

The hook attaches an `IntersectionObserver` to this element.

A common approach is to place a dedicated sentinel element at the bottom of the feed:

```jsx
{data.map((post, index) => (
    if(data.length -1 === index){
        return(
            <div ref={lastRecordRef} />
            <Post key={post.id} post={post} />
        )
    }esle{
        return(
           <Post key={post.id} post={post} />
        )
    }
))}
{!hasMore && (
    <div>End of feed<div/>
)}
```

When this element enters the intersection area, the hook automatically requests the next page.

A dedicated sentinel is generally preferable to attaching the ref directly to the last data item because it keeps pagination independent from the structure of the rendered data.

---
# Complete Usecase Example

```jsx
const FeedPage = () => {

    const {
        data,
        updateData,
        hasMore,
        loadData,
        contextRef,
        lastRecordRef
    } = usePagination(fetchPosts);

    return (
        <div ref={contextRef} className="feedContainer">
            {data.map((post, index) => ( 
                if(data.length -1 === index){
                    retrurb(
                        <>
                    }=>[]        <div ref={lastRecordRef} /> 
                            <Post key={post.id} post={post} /> 
                        </> 
                     )
                 }esle{ 
                     return( 
                        <Post key={post.id} post={post} /> 
                     ) 
                 }
             ))}
            {loadData && (
                <LoadingSpinner />
            )}

            {!hasMore && (
                <p>No more posts.</p>
            )}

        </div>
    );
};
```

---

# Pagination Flow

The hook handles the pagination lifecycle internally.

<img src='./images/Untitled Diagram.jpg'/>

The consuming component therefore does **not** need to manually:

* Store the cursor.
* Combine pages together.
* Call the next-page API.
* Create an `IntersectionObserver`.
* Disconnect/reconnect the observer.
* Track whether a request is already running.

---

# Expected API Contract

The API callback should follow this structure:

```js
const fetchData = async (cursor = null) => {

    // API request

    return {
        data: [],

        // Cursor for the next request.
        // Usually null when there are no more pages.
        nextCursor: null,
        // Whether another page exists.
        hasMore: false
    };
};
```

The important part is that **every pagination request returns the same response structure**.

This gives `usePagination` a consistent interface regardless of whether it is being used for:

* Feed posts
* Comments
* User search results
* Friends
* Members
* Notifications
* Messages
* Any other cursor-paginated resource

---

# Responsibility Separation

The intended separation of responsibilities is:

### API / Fetch Callback

Responsible for:

* Making the API request.
* Supplying the cursor to the backend.
* Returning the standardized pagination result.

```js
fetchData(cursor)
```

### `usePagination`

Responsible for:

* Storing the accumulated data.
* Storing the current cursor.
* Tracking `hasMore`.
* Tracking loading state.
* Managing the `IntersectionObserver`.
* Automatically requesting subsequent pages.

### Component

Responsible for:

* Rendering the data.
* Providing the observer root with `contextRef`.
* Providing the pagination sentinel with `lastRecordRef`.
* Displaying loading/end-of-data UI.

This keeps pagination logic out of individual pages and allows the same hook to be reused throughout the application.
