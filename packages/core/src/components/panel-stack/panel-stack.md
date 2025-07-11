@# Panel stack

**PanelStack** manages a stack of panels and displays only the topmost panel.

Each panel appears with a header containing a "back" button to return to the previous panel. The bottom-most
`initialPanel` cannot be closed or removed from the stack. Panels use
[**CSSTransition**](http://reactcommunity.org/react-transition-group/css-transition) for seamless transitions.

By default, only the currently active panel is rendered to the DOM. This means that other panels are unmounted and can
lose their component state as a user transitions between the panels. You can notice this in the example below as the
numeric counter is reset. To render all panels to the DOM and keep their React trees mounted, change the
`renderActivePanelOnly` prop.

@reactExample PanelStackExample

@## Panels

Panels are supplied as `Panel<T>` objects, where `renderPanel` and `props` are
used to render the panel element and `title` will appear in the header and back button.
This breakdown allows the component to avoid cloning elements.
Note that each panel is only mounted when it is atop the stack and is unmounted when
it is closed or when a panel opens above it.

`PanelStack` injects panel action callbacks into each panel renderer in addition to
the `props` defined by `Panel<T>`. These allow you to close the current panel or open a
new one on top of it during the panel's lifecycle. For example:

```tsx
import { Button, PanelProps } from "@blueprintjs/core";

type SettingsPanelInfo = {
    /* ...  */
};
type AccountSettingsPanelInfo = {
    /* ...  */
};
type NotificationSettingsPanelInfo = {
    /* ...  */
};

const AccountSettingsPanel: React.FC<PanelProps<AccountSettingsPanelInfo>> = props => {
    // implementation
};

const NotificationSettingsPanel: React.FC<PanelProps<NotificationSettingsPanelInfo>> = props => {
    // implementation
};

const SettingsPanel: React.FC<PanelProps<SettingsPanelInfo>> = props => {
    const { openPanel, closePanel, ...info } = props;

    const openAccountSettings = () =>
        openPanel({
            props: {
                /* ... */
            },
            renderPanel: AccountSettingsPanel,
            title: "Account settings",
        });
    const openNotificationSettings = () =>
        openPanel({
            props: {
                /* ... */
            },
            renderPanel: NotificationSettingsPanel,
            title: "Notification settings",
        });

    return (
        <>
            <Button onClick={openAccountSettings} text="Account settings" />
            <Button onClick={openNotificationSettings} text="Notification settings" />
        </>
    );
};
```

@interface Panel

@interface PanelActions

@## Props interface

**PanelStack** can be operated as a controlled or uncontrolled component.

If controlled, panels should be added to and removed from the _end_ of the `stack` array.

@interface PanelStackProps
