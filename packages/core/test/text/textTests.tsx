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

import { assert } from "chai";
import { mount } from "enzyme";
import * as React from "react";

import { Classes, Text } from "../../src";

describe("<Text>", () => {
    it("adds the className prop", () => {
        const textContent = "textContent";
        const className = "bp-test-class";
        const wrapper = mount(<Text className={className}>{textContent}</Text>);
        const element = wrapper.find(`.${className}`).hostNodes();
        assert.lengthOf(element, 1, `expected to find 1 .${className}`);
        assert.strictEqual(element.text(), textContent, "content incorrect value");
    });

    it("uses given title", () => {
        const textContent = "textContent";
        const title = "Test title";
        const wrapper = mount(<Text title={title}>{textContent}</Text>);
        const element = wrapper.find("div").first();
        const actualTitle = element.prop("title");
        assert.strictEqual(actualTitle, title, "component title should equal title prop");
    });

    describe("if ellipsize true", () => {
        it("truncates string children", () => {
            const textContent = "textContent";
            const wrapper = mount(<Text ellipsize={true}>{textContent}</Text>);
            const element = wrapper.find(`.${Classes.TEXT_OVERFLOW_ELLIPSIS}`);
            assert.lengthOf(element, 1, `missing ${Classes.TEXT_OVERFLOW_ELLIPSIS}`);
            assert.strictEqual(element.text(), textContent, "content incorrect value");
        });

        it("truncates jsx children", () => {
            const children = (
                <span>
                    {"computed text "}
                    <span>text in a span</span>
                </span>
            );
            const textContent = "computed text text in a span";
            const wrapper = mount(<Text ellipsize={true}>{children}</Text>);
            const element = wrapper.find(`.${Classes.TEXT_OVERFLOW_ELLIPSIS}`);
            assert.lengthOf(element, 1, `missing ${Classes.TEXT_OVERFLOW_ELLIPSIS}`);
            assert.strictEqual(element.text(), textContent, "content incorrect value");
        });

        describe("title behavior", () => {
            let containerElement: HTMLElement;

            beforeEach(() => {
                containerElement = document.createElement("div");
                document.documentElement.appendChild(containerElement);
            });

            afterEach(() => {
                containerElement.remove();
            });

            it("adds the title attribute when text overflows", () => {
                const textContent = new Array(100).join("this will overflow ");
                const wrapper = mount(<Text ellipsize={true}>{textContent}</Text>, {
                    attachTo: containerElement,
                });
                const actualTitle = wrapper.find(`.${Classes.TEXT_OVERFLOW_ELLIPSIS}`).prop("title");
                assert.strictEqual(actualTitle, textContent, "title should equal full text content");
            });

            it("does not add the title attribute when text does not overflow", () => {
                const textContent = "no overflow";
                let wrapper = mount(<Text ellipsize={true}>{textContent}</Text>, {
                    attachTo: containerElement,
                });
                wrapper = wrapper.update();
                const actualTitle = wrapper.find(`.${Classes.TEXT_OVERFLOW_ELLIPSIS}`).prop("title");
                assert.isUndefined(actualTitle, "title should be undefined");
            });

            it("uses given title even if text overflows", () => {
                const textContent = new Array(100).join("this will overflow ");
                const title = "Test title";
                const wrapper = mount(
                    <Text ellipsize={true} title={title}>
                        {textContent}
                    </Text>,
                    {
                        attachTo: containerElement,
                    },
                );
                const actualTitle = wrapper.find(`.${Classes.TEXT_OVERFLOW_ELLIPSIS}`).prop("title");
                assert.strictEqual(actualTitle, title, "component title should equal title prop");
            });
        });
    });

    describe("if ellipsize false", () => {
        it("doesn't truncate string children", () => {
            const textContent = "textContent";
            const wrapper = mount(<Text>{textContent}</Text>);
            const element = wrapper.find(`.${Classes.TEXT_OVERFLOW_ELLIPSIS}`);
            assert.lengthOf(element, 0, `unexpected ${Classes.TEXT_OVERFLOW_ELLIPSIS}`);
        });
    });
});
