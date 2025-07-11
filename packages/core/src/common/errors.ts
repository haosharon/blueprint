/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const ns = "[Blueprint]";

export const CLAMP_MIN_MAX = ns + ` clamp: max cannot be less than min`;

export const ALERT_WARN_CANCEL_PROPS = ns + ` <Alert> cancelButtonText and onCancel should be set together.`;
export const ALERT_WARN_CANCEL_ESCAPE_KEY =
    ns + ` <Alert> canEscapeKeyCancel enabled without onCancel or onClose handler.`;
export const ALERT_WARN_CANCEL_OUTSIDE_CLICK =
    ns + ` <Alert> canOutsideClickCancel enabled without onCancel or onClose handler.`;

export const ALIGN_INDICATOR_LEFT =
    ns + ` alignIndicator="left" is deprecated. Please use alignIndicator="start" instead.`;
export const ALIGN_INDICATOR_RIGHT =
    ns + ` alignIndicator="right" is deprecated. Please use alignIndicator="end" instead.`;
export const ALIGN_INDICATOR_CENTER =
    ns + `alignIndicator="center" is not supported on control components and will be ignored.`;
export const ALIGN_TEXT_LEFT = ns + ` alignText="left" is deprecated. Please use alignText="start" instead.`;
export const ALIGN_TEXT_RIGHT = ns + ` alignText="right" is deprecated. Please use alignText="end" instead.`;

export const BUTTON_WARN_MINIMAL = ns + ` <Button> minimal is deprecated. Please use variant="minimal".`;
export const BUTTON_GROUP_WARN_MINIMAL = ns + ` <ButtonGroup> minimal is deprecated. Please use variant="minimal".`;
export const BUTTON_WARN_OUTLINED = ns + ` <Button> outlined is deprecated. Please use variant="outlined".`;
export const BUTTON_GROUP_WARN_OUTLINED = ns + ` <ButtonGroup> outlined is deprecated. Please use variant="outlined".`;

export const HOTKEYS_HOTKEY_CHILDREN = ns + ` <Hotkeys> only accepts <Hotkey> children.`;

export const HOTKEYS_PROVIDER_NOT_FOUND =
    ns +
    ` useHotkeys() was used outside of a <HotkeysProvider> context. These hotkeys will not be shown in the hotkeys help dialog.`;
export const HOTKEYS_TARGET_CHILDREN_LOCAL_HOTKEYS =
    ns +
    ` <HotkeysTarget> was configured with local hotkeys, but you did not use the generated event handlers to bind their event handlers. Try using a render function as the child of this component.`;

export const INPUT_WARN_LEFT_ELEMENT_LEFT_ICON_MUTEX =
    ns + ` <InputGroup> leftElement and leftIcon prop are mutually exclusive, with leftElement taking priority.`;

export const NAVBAR_GROUP_ALIGN_CENTER =
    ns +
    ` <NavbarGroup> does not support align="center". Only "left" or "right" alignment is allowed, and align="center" will be ignored.`;

export const NUMERIC_INPUT_MIN_MAX = ns + ` <NumericInput> requires min to be no greater than max if both are defined.`;
export const NUMERIC_INPUT_MINOR_STEP_SIZE_BOUND =
    ns + ` <NumericInput> requires minorStepSize to be no greater than stepSize.`;
export const NUMERIC_INPUT_MAJOR_STEP_SIZE_BOUND =
    ns + ` <NumericInput> requires stepSize to be no greater than majorStepSize.`;
export const NUMERIC_INPUT_MINOR_STEP_SIZE_NON_POSITIVE =
    ns + ` <NumericInput> requires minorStepSize to be strictly greater than zero.`;
export const NUMERIC_INPUT_MAJOR_STEP_SIZE_NON_POSITIVE =
    ns + ` <NumericInput> requires majorStepSize to be strictly greater than zero.`;
export const NUMERIC_INPUT_STEP_SIZE_NON_POSITIVE =
    ns + ` <NumericInput> requires stepSize to be strictly greater than zero.`;
export const NUMERIC_INPUT_CONTROLLED_VALUE_INVALID =
    ns + ` <NumericInput> controlled value prop does not adhere to stepSize, min, and/or max constraints.`;

export const OVERFLOW_LIST_OBSERVE_PARENTS_CHANGED =
    ns + ` <OverflowList> does not support changing observeParents after mounting.`;

export const POPOVER_REQUIRES_TARGET = `${ns} <Popover> requires renderTarget prop or a child element.`;
export const POPOVER_HAS_BACKDROP_INTERACTION = `${ns} <Popover hasBackdrop={true}> requires interactionKind="click".`;
export const POPOVER_WARN_TOO_MANY_CHILDREN = `${ns} <Popover> supports only one child which is rendered as its target; additional children are ignored.`;
export const POPOVER_WARN_DOUBLE_TARGET =
    ns + ` <Popover> with children ignores renderTarget prop; use either prop or children.`;
export const POPOVER_WARN_EMPTY_CONTENT = ns + ` Disabling <Popover> with empty/whitespace content...`;
export const POPOVER_WARN_HAS_BACKDROP_INLINE = ns + ` <Popover usePortal={false}> ignores hasBackdrop`;
export const POPOVER_WARN_PLACEMENT_AND_POSITION_MUTEX =
    ns + ` <Popover> supports either placement or position prop, not both.`;
export const POPOVER_WARN_UNCONTROLLED_ONINTERACTION = ns + ` <Popover> onInteraction is ignored when uncontrolled.`;
export const POPOVER_WARN_TARGET_PROPS_WITH_RENDER_TARGET =
    ns + ` <Popover> targetProps value is ignored when renderTarget API is used.`;

export const RADIOGROUP_WARN_CHILDREN_OPTIONS_MUTEX =
    ns + ` <RadioGroup> children and options prop are mutually exclusive, with options taking priority.`;

export const SLIDER_ZERO_STEP = ns + ` <Slider> stepSize must be greater than zero.`;
export const SLIDER_ZERO_LABEL_STEP = ns + ` <Slider> labelStepSize must be greater than zero.`;
export const SLIDER_MIN = ns + ` <Slider> min prop must be a finite number.`;
export const SLIDER_MAX = ns + ` <Slider> max prop must be a finite number.`;
export const RANGESLIDER_NULL_VALUE = ns + ` <RangeSlider> value prop must be an array of two non-null numbers.`;
export const MULTISLIDER_INVALID_CHILD = ns + ` <MultiSlider> children must be <SliderHandle>s or <SliderTrackStop>s`;
export const MULTISLIDER_WARN_LABEL_STEP_SIZE_LABEL_VALUES_MUTEX =
    ns +
    ` <MultiSlider> labelStepSize and labelValues prop are mutually exclusive, with labelStepSize taking priority.`;

export const SPINNER_WARN_CLASSES_SIZE = ns + ` <Spinner> Classes.SMALL/LARGE are ignored if size prop is set.`;

export const TOASTER_CREATE_NULL =
    ns +
    ` OverlayToaster.create() is not supported inside React lifecycle methods in React 16.` +
    ` See usage example on the docs site. https://blueprintjs.com/docs/#core/components/toast.example`;
export const TOASTER_MAX_TOASTS_INVALID =
    ns + ` <OverlayToaster> maxToasts is set to an invalid number, must be greater than 0`;
export const TOASTER_WARN_INLINE =
    ns + ` OverlayToaster.create() ignores inline prop as it always creates a new element.`;

export const DIALOG_WARN_NO_HEADER_ICON = ns + ` <Dialog> iconName is ignored if title is omitted.`;
export const DIALOG_WARN_NO_HEADER_CLOSE_BUTTON =
    ns + ` <Dialog> isCloseButtonShown prop is ignored if title is omitted.`;

export const DRAWER_ANGLE_POSITIONS_ARE_CASTED =
    ns + ` <Drawer> all angle positions are casted into pure position (TOP, BOTTOM, LEFT or RIGHT)`;

export const OVERLAY2_REQUIRES_OVERLAY_PROVDER =
    ns +
    ` <Overlay2> was used outside of a <OverlaysProvider> context. This will no longer be supported in ` +
    `Blueprint v6. See https://github.com/palantir/blueprint/wiki/Overlay2-migration`;
export const OVERLAY_CHILD_REF_AND_REFS_MUTEX =
    ns + ` <Overlay2> cannot use childRef and childRefs props simultaneously`;
export const OVERLAY_WITH_MULTIPLE_CHILDREN_REQUIRES_CHILD_REFS =
    ns + ` <Overlay2> requires childRefs prop when rendering multiple child elements`;
export const OVERLAY_CHILD_REQUIRES_KEY =
    ns + ` <Overlay2> requires each child element to have a unique key prop when childRefs is used`;

export function logDeprecatedSizeWarning(component: string, props: Partial<Record<"large" | "small", boolean>>) {
    const { large, small } = props;
    if (large && small) {
        console.warn(
            ns +
                ` <${component}> large and small props are mutually exclusive. Please use size="large" or size="small" instead.`,
        );
    } else if (large) {
        console.warn(ns + ` <${component}> large is deprecated. Please use size="large" instead.`);
    } else if (small) {
        console.warn(ns + ` <${component}> small is deprecated. Please use size="small" instead.`);
    }
}
