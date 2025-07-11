@# Dialog

The **Dialog** component presents content overlaid over other parts of the UI via
[**Overlay2**](#core/components/overlay2).

<div class="@ns-callout @ns-intent-primary @ns-icon-info-sign @ns-callout-has-body-content">
    <h5 class="@ns-heading">Terminology note</h5>

The term "modal" is sometimes used to mean "dialog," but this is a misnomer.
_Modal_ is an adjective that describes parts of a UI. An element is considered to be "modal" if it
[blocks interaction with the rest of the application](https://en.wikipedia.org/wiki/Modal_window).
We use the term "dialog" in Blueprint to avoid confusion with the adjective.

</div>

Blueprint provides two types of dialogs:

1.  Standard dialog: show single view using the `<Dialog>` component
2.  Multi-step dialog: show multiple sequential views using the `<MultistepDialog>` component.

@## Dialog

@reactExample DialogExample

@## Usage

<div class="@ns-callout @ns-intent-warning @ns-icon-warning-sign @ns-callout-has-body-content">
    <h5 class="@ns-heading">

[OverlaysProvider](#core/context/overlays-provider) recommended

</h5>

This component renders an **Overlay2** which works best inside a React tree which includes an
**OverlaysProvider**. Blueprint v5.x includes a backwards-compatibile shim which allows this context
to be optional, but it will be required in a future major version. See the full
[migration guide](https://github.com/palantir/blueprint/wiki/Overlay2-migration) on the wiki.

</div>

A standard **Dialog** renders its contents in an [**Overlay2**](#core/components/overlay2) with a
`Classes.DIALOG` element. You can use some simple dialog markup sub-components or CSS classes
to structure its contents:

```tsx
<Dialog title="Informational dialog" icon="info-sign">
    <DialogBody>{/* body contents here */}</DialogBody>
    <DialogFooter actions={<Button intent="primary" text="Close" onClick={/* ... */} />} />
</Dialog>
```

@### Dialog props

`<Dialog>` is a stateless React component controlled by the `isOpen` prop.

The children you provide to this component are rendered as contents inside the
`Classes.DIALOG` element.

@interface DialogProps

@### Dialog body props

`<DialogBody>` renders a `Classes.DIALOG_BODY` element, optionally with a constrained container
height which allows vertical scrolling of its content.

@interface DialogBodyProps

@### Dialog footer props

`<DialogFooter>` renders a `Classes.DIALOG_FOOTER` element. Footer "actions" are rendered
towards the right side of the footer container element.

@interface DialogFooterProps

@## Multistep dialog

@reactExample MultistepDialogExample

@### Multistep dialog props

**MultistepDialog** is a wrapper around **Dialog** that displays a dialog with multiple steps. Each step has a
corresponding panel.

This component expects `<DialogStep>` child elements: each "step" is rendered in order and its panel is shown as the
dialog body content when the corresponding step is selected in the navigation panel.

@interface MultistepDialogProps

@### DialogStep

**DialogStep** is a minimal wrapper with no functionality of its own&mdash;it is managed entirely by its parent
**MultistepDialog** container. Typically, you should render a `<DialogBody>` element as the `panel` element. A step's
title text can be set via the `title` prop.

@interface DialogStepProps
