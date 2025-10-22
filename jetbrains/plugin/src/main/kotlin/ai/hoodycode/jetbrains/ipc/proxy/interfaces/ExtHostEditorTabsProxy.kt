// SPDX-FileCopyrightText: 2025 Weibo, Inc.
//
// SPDX-License-Identifier: Apache-2.0

package ai.hoodycode.jetbrains.ipc.proxy.interfaces

import ai.hoodycode.jetbrains.editor.EditorTabGroupDto
import ai.hoodycode.jetbrains.editor.TabOperation

interface ExtHostEditorTabsProxy {
    fun acceptEditorTabModel(tabGroups: List<EditorTabGroupDto>)
    fun acceptTabGroupUpdate(groupDto: EditorTabGroupDto)
    fun acceptTabOperation(operation: TabOperation)
}
