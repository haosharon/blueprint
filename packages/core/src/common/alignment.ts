/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
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

/** Alignment along the horizontal axis. */
export const Alignment = {
    CENTER: "center" as const,
    END: "end" as const,
    /**
     * @deprecated use `Alignment.START` instead.
     */
    LEFT: "left" as const,
    /**
     * @deprecated use `Alignment.END` instead.
     */
    RIGHT: "right" as const,
    START: "start" as const,
};
export type Alignment = (typeof Alignment)[keyof typeof Alignment];

export const TextAlignment = {
    CENTER: "center" as const,
    END: "end" as const,
    START: "start" as const,
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TextAlignment = (typeof TextAlignment)[keyof typeof TextAlignment];
