@# Toast

A toast is a lightweight, ephemeral notice from an application in direct response to a user's action.

**Toasts** can be configured to appear at either the top or the bottom of an application window.
It is possible to show more than one toast on-screen at a time.

@reactExample ToastExample

@## Usage

@### Toast

**Toasts** have a built-in timeout of five seconds. Users can also dismiss them manually by clicking
the &times; button. overing the cursor over a toast prevents it from disappearing. When the cursor
leaves the toast, the toast's timeout restarts. Similarly, focussing the toast DOM element (for
example, by hitting the `tab` key) halts the timeout, and blurring restarts the timeout.

You may add one additional action button to a toast. You might use this to provide an undo button,
for example.

You may also apply the same visual intents to **Toasts** as other core components like
[**Buttons**](#core/components/button.css).

@interface ToastProps

@### OverlayToaster

The **OverlayToaster** component (previously named **Toaster**) is a stateful container for a single
list of toasts. Internally, it uses [**Overlay2**](#core/components/overlay2) to manage children and
transitions. It can be vertically aligned along the top or bottom edge of its container (new toasts
will slide in from that edge) and horizontally aligned along the left edge, center, or right edge
of its container.

There are three ways to use **OverlayToaster**:

1. **Recommended**: use the `OverlayToaster.create()` static method to create a new `Toaster` instance:

    ```ts
    const myToaster: Toaster = await OverlayToaster.create({ position: "bottom" });
    myToaster.show({ ...toastOptions });
    ```

    We recommend calling `OverlayToaster.create` once in your application and
    [sharing the generated instance](#core/components/toast.example) throughout your application.

2. Render an `<OverlayToaster>` with `<Toast>` children:
    ```ts
    render(
        <OverlayToaster>
            <Toast {...toastOptions} />
        </OverlayToaster>,
        targetElement,
    );
    ```
3. Use a ref callback or object to access toaster instance methods.
    - Example with ref callback:
    ```ts
    render(<OverlayToaster ref={(ref: Toaster | null) => ref?.show({ ...toastOptions })} />, targetElement);
    ```
    - Example with ref object (note that React type constraints require us to use the more specific `OverlayToaster` type):
    ```ts
    const myToaster = React.createRef<OverlayToaster>();
    render(<OverlayToaster ref={myToaster} />, targetElement);
    myToaster.current?.show({ ...toastOptions });
    ```

<div class="@ns-callout @ns-intent-primary @ns-icon-info-sign @ns-callout-has-body-content">
    <h5 class="@ns-heading">Working with multiple toasters</h5>

You can have multiple toasters in a single application, but you must ensure that each has a unique
`position` to prevent overlap.

</div>

<div class="@ns-callout @ns-intent-primary @ns-icon-info-sign @ns-callout-has-body-content">
    <h5 class="@ns-heading">Toaster focus</h5>

**OverlayToaster** always disables Overlay2's `enforceFocus` behavior (meaning that you're not blocked
from accessing other parts of the application while a toast is active), and by default also
disables `autoFocus` (meaning that focus will not switch to a toast when it appears). You can
enable `autoFocus` for an individual `OverlayToaster` via a prop, if desired.

</div>

@interface OverlayToasterProps

@## Static usage

**OverlayToaster** provides the static `create` method that returns a promise that resolves to a new `Toaster`,
rendered into an element attached to `<body>`. A toaster instance has a collection of methods to show and
hide toasts in its given container.

```ts
OverlayToaster.create(props?: OverlayToasterProps, options?: OverlayToasterCreateOptions): Promise<Toaster>;
```

@interface OverlayToasterCreateOptions

The toaster will be rendered into a new element appended to the given `container`.
The `container` determines which element toasts are positioned relative to; the default value of
`<body>` allows them to use the entire viewport.

The returned promise contains a `Toaster` which is a minimal interface that exposes only the instance
methods detailed below. It can be thought of as `OverlayToaster` minus the `React.Component` methods,
because the `OverlayToaster` should not be treated as a normal React component.

A promise is returned as React components cannot be rendered synchronously after React version 18.
If this makes `Toaster` usage difficult outside of a function that's not `async`, it's still
possible to attach `.then()` handlers to the returned toaster.

```ts
function synchronousFn() {
    const toasterPromise = OverlayToaster.create({});
    toasterPromise.then(toaster => toaster.show({ message: "Toast!" }));
}
```

Note that `OverlayToaster.create()` will throw an error if invoked inside a component lifecycle
method, as `ReactDOM.render()` will return `null` resulting in an inaccessible toaster instance.

<div class="@ns-callout @ns-intent-primary @ns-icon-info-sign @ns-callout-has-body-content">
    <h5 class="@ns-heading">Beware of memory leaks</h5>

The static `create` method creates a new `OverlayToaster` instance for the full lifetime of your
application. Since there's no React parent component, this method creates a new DOM node as a container for the
rendered `<OverlayToaster>` component. Every `create` call will add a new DOM node. We do not recommend creating a
new `Toaster` every time a toast needs to be shown. To minimize leaking:

1. Call `OverlayToaster.create` once in an application and [share the instance](#core/components/toast.example).
2. Consider one of the alternative APIs that mount the `<OverlayToaster>` somewhere in the application's React component
tree. This provides component lifecycle management out of the box. See
[_React component usage_](#core/components/toast.react-component-usage) for an example.

</div>

@interface Toaster

@### Example

Your application can contain several `ToasterInstance`s and easily share them across the codebase as modules.

The following code samples demonstrate our preferred pattern for intergrating a toaster into a React application:

#### `toaster.ts`

```ts
import { OverlayToaster, Position } from "@blueprintjs/core";

/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster = OverlayToaster.create({
    className: "recipe-toaster",
    position: Position.TOP,
});
```

#### `application.tsx`

```tsx
import { Button } from "@blueprintjs/core";
import * as React from "react";
import { AppToaster } from "./toaster";

export const App: React.FC = () => {
    const handleClick = React.useCallback(() => {
        // create toasts in response to interactions.
        // in most cases, it's enough to simply create and forget (thanks to timeout).
        (await AppToaster).show({ message: "Toasted." });
    }, []);

    return <Button onClick={handleClick} text="Toast please" />;
}
```

The example below uses the `OverlayToaster.create()` static method. Clicking the button will create a new toaster mounted to `<body>`, show a message, and unmount the toaster from the DOM once the message is dismissed.

@reactExample ToastCreateAsyncExample

@## React component usage

Render the `<OverlayToaster>` component like any other element and supply `<Toast>` elements as
`children`. You can optionally attach a `ref` handler to access the instance methods, but we
strongly recommend using the [`OverlayToaster.create` static method](#core/components/toast.static-usage)
documented above instead. Note that `children` and `ref` can be used together, but `children` will
always appear _after_ toasts created with `ref.show()`.

```tsx
import { Button, OverlayToaster, Position, Toast, ToastOptions } from "@blueprintjs/core";
import * as React from "react";

function MyComponent() {
    const [toasts, setToasts] = React.useState<ToastOptions[]>([]);
    const toaster = React.useRef<OverlayToaster>(null);

    const addToastViaRef = React.useCallback(() => {
        toaster.current?.show({ message: "Toasted!" });
    }, []);

    const addToastLocally = React.useCallback(() => {
        setToasts(t => [...t, { key: "toasted", message: "Toasted!" }]);
    }, []);

    return (
        <div>
            <Button onClick={addToastViaRef} text="Procure toast remotely" />
            <Button onClick={addToastLocally} text="Procure toast locally" />
            <OverlayToaster position={Position.TOP_RIGHT} ref={toaster}>
                {/* "Toasted!" will appear here after clicking button. */}
                {toasts.map(toast => (
                    <Toast key={toast.key} {...toast} />
                ))}
            </OverlayToaster>
        </div>
    );
}
```
