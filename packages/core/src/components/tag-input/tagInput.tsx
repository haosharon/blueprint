/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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

import classNames from "classnames";
import * as React from "react";

import { type IconName, IconSize } from "@blueprintjs/icons";

import { AbstractPureComponent, Classes, type NonSmallSize, refHandler, setRef, Utils } from "../../common";
import {
    DISPLAYNAME_PREFIX,
    type HTMLInputProps,
    type IntentProps,
    type MaybeElement,
    type Props,
} from "../../common/props";
import { getActiveElement } from "../../common/utils";
import { Icon } from "../icon/icon";
import { Tag, type TagProps } from "../tag/tag";

import { ResizableInput } from "./resizableInput";

/**
 * The method in which a `TagInput` value was added.
 * - `"default"` - indicates that a value was added by manual selection.
 * - `"blur"` - indicates that a value was added when the `TagInput` lost focus.
 *   This is only possible when `addOnBlur=true`.
 * - `"paste"` - indicates that a value was added via paste. This is only
 *   possible when `addOnPaste=true`.
 */
export type TagInputAddMethod = "default" | "blur" | "paste";

export interface TagInputProps extends IntentProps, Props {
    /**
     * If true, `onAdd` will be invoked when the input loses focus.
     * Otherwise, `onAdd` is only invoked when `enter` is pressed.
     *
     * @default false
     */
    addOnBlur?: boolean;

    /**
     * If true, `onAdd` will be invoked when the user pastes text containing the `separator`
     * into the input. Otherwise, pasted text will remain in the input.
     *
     * __Note:__ For example, if `addOnPaste=true` and `separator="\n"` (new line), then:
     * - Pasting `"hello"` will _not_ invoke `onAdd`
     * - Pasting `"hello\n"` will invoke `onAdd` with `["hello"]`
     * - Pasting `"hello\nworld"` will invoke `onAdd` with `["hello", "world"]`
     *
     * @default true
     */
    addOnPaste?: boolean;

    /**
     * Whether the component should automatically resize as a user types in the text input.
     * This will have no effect when `fill={true}`.
     *
     * @default false
     */
    autoResize?: boolean;

    /**
     * Optional child elements which will be rendered between the selected tags and
     * the text input. Rendering children is usually unnecessary.
     *
     * @default undefined
     */
    children?: React.ReactNode;

    /**
     * Whether the component is non-interactive.
     * Note that you'll also need to disable the component's `rightElement`,
     * if appropriate.
     *
     * @default false
     */
    disabled?: boolean;

    /** Whether the tag input should take up the full width of its container. */
    fill?: boolean;

    /**
     * React props to pass to the `<input>` element.
     * Note that `ref` and `key` are not supported here; use `inputRef` below.
     * Also note that `inputProps.style.width` will be overriden if `autoResize={true}`.
     */
    inputProps?: HTMLInputProps;

    /** Ref handler for the `<input>` element. */
    inputRef?: React.Ref<HTMLInputElement>;

    /** Controlled value of the `<input>` element. This is shorthand for `inputProps={{ value }}`. */
    inputValue?: string;

    /**
     * Whether the tag input should use a large size.
     *
     * @deprecated use `size="large"` instead.
     * @default false
     */
    large?: boolean;

    /** Name of a Blueprint UI icon (or an icon element) to render on the left side of the input. */
    leftIcon?: IconName | MaybeElement;

    /**
     * Callback invoked when new tags are added by the user pressing `enter` on the input.
     * Receives the current value of the input field split by `separator` into an array.
     * New tags are expected to be appended to the list.
     *
     * The input will be cleared after `onAdd` is invoked _unless_ the callback explicitly
     * returns `false`. This is useful if the provided `value` is somehow invalid and should
     * not be added as a tag.
     */
    onAdd?: (values: string[], method: TagInputAddMethod) => boolean | void;

    /**
     * Callback invoked when new tags are added or removed. Receives the updated list of `values`:
     * new tags are appended to the end of the list, removed tags are removed at their index.
     *
     * Like `onAdd`, the input will be cleared after this handler is invoked _unless_ the callback
     * explicitly returns `false`.
     *
     * This callback essentially implements basic `onAdd` and `onRemove` functionality and merges
     * the two handlers into one to simplify controlled usage.
     * ```
     */
    onChange?: (values: React.ReactNode[]) => boolean | void;

    /**
     * Callback invoked when the value of `<input>` element is changed.
     * This is shorthand for `inputProps={{ onChange }}`.
     */
    onInputChange?: React.FormEventHandler<HTMLInputElement>;

    /**
     * Callback invoked when the user depresses a keyboard key.
     * Receives the event and the index of the active tag (or `undefined` if
     * focused in the input).
     */
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>, index?: number) => void;

    /**
     * Callback invoked when the user releases a keyboard key.
     * Receives the event and the index of the active tag (or `undefined` if
     * focused in the input).
     */
    onKeyUp?: (event: React.KeyboardEvent<HTMLElement>, index?: number) => void;

    /**
     * Callback invoked when the user clicks the X button on a tag.
     * Receives value and index of removed tag.
     */
    onRemove?: (value: React.ReactNode, index: number) => void;

    /**
     * Input placeholder text which will not appear if `values` contains any items
     * (consistent with default HTML input behavior).
     * Use `inputProps.placeholder` if you want the placeholder text to _always_ appear.
     *
     * If you define both `placeholder` and `inputProps.placeholder`, then the former will appear
     * when `values` is empty and the latter at all other times.
     */
    placeholder?: string;

    /**
     * Element to render on right side of input.
     * For best results, use a small spinner or minimal button (button height will adjust if `TagInput` uses large styles).
     * Other elements will likely require custom styles for correct positioning.
     */
    rightElement?: React.JSX.Element;

    /**
     * Separator pattern used to split input text into multiple values. Default value splits on commas and newlines.
     * Explicit `false` value disables splitting (note that `onAdd` will still receive an array of length 1).
     *
     * @default /[,\n\r]/
     */
    separator?: string | RegExp | false;

    /**
     * The size of the tag input.
     *
     * @default "medium"
     */
    size?: NonSmallSize;

    /**
     * React props to pass to each `Tag`. Provide an object to pass the same props to every tag,
     * or a function to customize props per tag.
     *
     * If you define `onRemove` here then you will have to implement your own tag removal
     * handling as `TagInput`'s own `onRemove` handler will never be invoked.
     */
    tagProps?: TagProps | ((value: React.ReactNode, index: number) => TagProps);

    /**
     * Controlled tag values. Each value will be rendered inside a `Tag`, which can be customized
     * using `tagProps`. Therefore, any valid React node can be used as a `TagInput` value; falsy
     * values will not be rendered.
     */
    values: readonly React.ReactNode[];
}

export interface TagInputState {
    activeIndex: number;
    inputValue: string;
    isInputFocused: boolean;
    prevInputValueProp?: string;
}

/** special value for absence of active tag */
const NONE = -1;

/**
 * Tag input component.
 *
 * @see https://blueprintjs.com/docs/#core/components/tag-input
 */
export class TagInput extends AbstractPureComponent<TagInputProps, TagInputState> {
    public static displayName = `${DISPLAYNAME_PREFIX}.TagInput`;

    public static defaultProps: Partial<TagInputProps> = {
        addOnBlur: false,
        addOnPaste: true,
        autoResize: false,
        inputProps: {},
        separator: /[,\n\r]/,
        tagProps: {},
    };

    public static getDerivedStateFromProps(
        props: Readonly<TagInputProps>,
        state: Readonly<TagInputState>,
    ): Partial<TagInputState> | null {
        if (props.inputValue !== state.prevInputValueProp) {
            return {
                inputValue: props.inputValue,
                prevInputValueProp: props.inputValue,
            };
        }
        return null;
    }

    public state: TagInputState = {
        activeIndex: NONE,
        inputValue: this.props.inputValue || "",
        isInputFocused: false,
    };

    public inputElement: HTMLInputElement | null = null;

    private handleRef: React.Ref<HTMLInputElement> = refHandler(this, "inputElement", this.props.inputRef);

    public render() {
        const {
            autoResize,
            className,
            disabled,
            fill,
            inputProps,
            intent,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            large,
            leftIcon,
            placeholder,
            size = "medium",
            values,
        } = this.props;

        const classes = classNames(
            Classes.INPUT,
            Classes.TAG_INPUT,
            {
                [Classes.ACTIVE]: this.state.isInputFocused,
                [Classes.DISABLED]: disabled,
                [Classes.FILL]: fill,
            },
            Classes.intentClass(intent),
            Classes.sizeClass(size, { large }),
            className,
        );
        const isLarge = classes.indexOf(Classes.LARGE) > NONE;

        // use placeholder prop only if it's defined and values list is empty or contains only falsy values
        const isSomeValueDefined = values.some(val => !!val);
        const resolvedPlaceholder = placeholder == null || isSomeValueDefined ? inputProps?.placeholder : placeholder;

        // final props that may be sent to <input> or <ResizableInput>
        const resolvedInputProps = {
            value: this.state.inputValue,
            ...inputProps,
            className: classNames(Classes.INPUT_GHOST, inputProps?.className),
            disabled,
            onChange: this.handleInputChange,
            onFocus: this.handleInputFocus,
            onKeyDown: this.handleInputKeyDown,
            onKeyUp: this.handleInputKeyUp,
            onPaste: this.handleInputPaste,
            placeholder: resolvedPlaceholder,
            ref: this.handleRef,
        } satisfies React.HTMLProps<HTMLElement>;

        return (
            <div className={classes} onBlur={this.handleContainerBlur} onClick={this.handleContainerClick}>
                <Icon
                    className={Classes.TAG_INPUT_ICON}
                    icon={leftIcon}
                    size={isLarge ? IconSize.LARGE : IconSize.STANDARD}
                />
                <div className={Classes.TAG_INPUT_VALUES}>
                    {values.map(this.maybeRenderTag)}
                    {this.props.children}
                    {autoResize ? <ResizableInput {...resolvedInputProps} /> : <input {...resolvedInputProps} />}
                </div>
                {this.props.rightElement}
            </div>
        );
    }

    public componentDidUpdate(prevProps: TagInputProps) {
        if (prevProps.inputRef !== this.props.inputRef) {
            setRef(prevProps.inputRef, null);
            this.handleRef = refHandler(this, "inputElement", this.props.inputRef);
            setRef(this.props.inputRef, this.inputElement);
        }
    }

    private addTags = (value: string, method: TagInputAddMethod = "default") => {
        const { inputValue, onAdd, onChange, values } = this.props;
        const newValues = this.getValues(value);
        let shouldClearInput = onAdd?.(newValues, method) !== false && inputValue === undefined;
        // avoid a potentially expensive computation if this prop is omitted
        if (Utils.isFunction(onChange)) {
            shouldClearInput = onChange([...values, ...newValues]) !== false && shouldClearInput;
        }
        // only explicit return false cancels text clearing
        if (shouldClearInput) {
            this.setState({ inputValue: "" });
        }
    };

    private maybeRenderTag = (tag: React.ReactNode, index: number) => {
        if (!tag) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const { large, size, tagProps } = this.props;
        const props = Utils.isFunction(tagProps) ? tagProps(tag, index) : tagProps;
        return (
            <Tag
                active={index === this.state.activeIndex}
                data-tag-index={index}
                key={tag + "__" + index}
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                large={large}
                onRemove={this.props.disabled ? undefined : this.handleRemoveTag}
                size={size}
                {...props}
            >
                {tag}
            </Tag>
        );
    };

    private getNextActiveIndex(direction: 1 | -1) {
        const { activeIndex } = this.state;
        if (activeIndex === NONE) {
            // nothing active & moving left: select last defined value. otherwise select nothing.
            return direction < 0 ? this.findNextIndex(this.props.values.length, -1) : NONE;
        } else {
            // otherwise, move in direction and clamp to bounds.
            // note that upper bound allows going one beyond last item
            // so focus can move off the right end, into the text input.
            return this.findNextIndex(activeIndex, direction);
        }
    }

    private findNextIndex(startIndex: number, direction: 1 | -1) {
        const { values } = this.props;
        let index = startIndex + direction;
        while (index > 0 && index < values.length && !values[index]) {
            index += direction;
        }
        return Utils.clamp(index, 0, values.length);
    }

    /**
     * Splits inputValue on separator prop,
     * trims whitespace from each new value,
     * and ignores empty values.
     */
    private getValues(inputValue: string) {
        const { separator } = this.props;
        // NOTE: split() typings define two overrides for string and RegExp.
        // this does not play well with our union prop type, so we'll just declare it as a valid type.
        return (separator === false ? [inputValue] : inputValue.split(separator as string))
            .map(val => val.trim())
            .filter(val => val.length > 0);
    }

    private handleContainerClick = () => {
        this.inputElement?.focus();
    };

    private handleContainerBlur = ({ currentTarget }: React.FocusEvent<HTMLDivElement>) => {
        this.requestAnimationFrame(() => {
            // we only care if the blur event is leaving the container.
            // defer this check using rAF so activeElement will have updated.
            const isFocusInsideContainer = currentTarget.contains(getActiveElement(this.inputElement));
            if (!isFocusInsideContainer) {
                if (this.props.addOnBlur && this.state.inputValue !== undefined && this.state.inputValue.length > 0) {
                    this.addTags(this.state.inputValue, "blur");
                }
                this.setState({ activeIndex: NONE, isInputFocused: false });
            }
        });
    };

    private handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        this.setState({ isInputFocused: true });
        this.props.inputProps?.onFocus?.(event);
    };

    private handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ activeIndex: NONE, inputValue: event.currentTarget.value });
        this.props.onInputChange?.(event);
        this.props.inputProps?.onChange?.(event);
    };

    private handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const { selectionEnd, value } = event.currentTarget;
        const { activeIndex } = this.state;

        let activeIndexToEmit = activeIndex;

        // do not add a new tag if the user is composing (e.g. for Japanese or Chinese)
        if (event.key === "Enter" && !event.nativeEvent.isComposing && value.length > 0) {
            this.addTags(value, "default");
        } else if (selectionEnd === 0 && this.props.values.length > 0) {
            // cursor at beginning of input allows interaction with tags.
            // use selectionEnd to verify cursor position and no text selection.
            const direction = Utils.getArrowKeyDirection(event, ["ArrowLeft"], ["ArrowRight"]);
            if (direction !== undefined) {
                const nextActiveIndex = this.getNextActiveIndex(direction);
                if (nextActiveIndex !== activeIndex) {
                    event.stopPropagation();
                    activeIndexToEmit = nextActiveIndex;
                    this.setState({ activeIndex: nextActiveIndex });
                }
            } else if (event.key === "Backspace") {
                this.handleBackspaceToRemove(event);
            } else if (event.key === "Delete") {
                this.handleDeleteToRemove(event);
            }
        }

        this.invokeKeyPressCallback("onKeyDown", event, activeIndexToEmit);
    };

    private handleInputKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        this.invokeKeyPressCallback("onKeyUp", event, this.state.activeIndex);
    };

    private handleInputPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const { separator } = this.props;
        const value = event.clipboardData.getData("text");

        if (!this.props.addOnPaste || value.length === 0) {
            return;
        }

        // special case as a UX nicety: if the user pasted only one value with no delimiters in it, leave that value in
        // the input field so that the user can refine it before converting it to a tag manually.
        if (separator === false || value.split(separator!).length === 1) {
            return;
        }

        event.preventDefault();
        this.addTags(value, "paste");
    };

    private handleRemoveTag = (event: React.MouseEvent<HTMLSpanElement>) => {
        // using data attribute to simplify callback logic -- one handler for all children
        const index = +event.currentTarget.parentElement!.getAttribute("data-tag-index")!;
        this.removeIndexFromValues(index);
    };

    private handleBackspaceToRemove(event: React.KeyboardEvent<HTMLInputElement>) {
        const previousActiveIndex = this.state.activeIndex;
        // always move leftward one item (this will focus last item if nothing is focused)
        this.setState({ activeIndex: this.getNextActiveIndex(-1) });
        // delete item if there was a previous valid selection (ignore first backspace to focus last item)
        if (this.isValidIndex(previousActiveIndex)) {
            event.stopPropagation();
            this.removeIndexFromValues(previousActiveIndex);
        }
    }

    private handleDeleteToRemove(event: React.KeyboardEvent<HTMLInputElement>) {
        const { activeIndex } = this.state;
        if (this.isValidIndex(activeIndex)) {
            event.stopPropagation();
            this.removeIndexFromValues(activeIndex);
        }
    }

    /** Remove the item at the given index by invoking `onRemove` and `onChange` accordingly. */
    private removeIndexFromValues(index: number) {
        const { onChange, onRemove, values } = this.props;
        onRemove?.(values[index], index);
        onChange?.(values.filter((_, i) => i !== index));
    }

    private invokeKeyPressCallback(
        propCallbackName: "onKeyDown" | "onKeyUp",
        event: React.KeyboardEvent<HTMLInputElement>,
        activeIndex: number,
    ) {
        this.props[propCallbackName]?.(event, activeIndex === NONE ? undefined : activeIndex);
        this.props.inputProps![propCallbackName]?.(event);
    }

    /** Returns whether the given index represents a valid item in `this.props.values`. */
    private isValidIndex(index: number) {
        return index !== NONE && index < this.props.values.length;
    }
}
