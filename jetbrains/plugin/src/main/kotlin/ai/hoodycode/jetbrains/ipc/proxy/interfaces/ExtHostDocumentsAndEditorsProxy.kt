// SPDX-FileCopyrightText: 2025 Weibo, Inc.
//
// SPDX-License-Identifier: Apache-2.0

package ai.hoodycode.jetbrains.ipc.proxy.interfaces

import ai.hoodycode.jetbrains.editor.DocumentsAndEditorsDelta


interface ExtHostDocumentsAndEditorsProxy {
    fun acceptDocumentsAndEditorsDelta(d: DocumentsAndEditorsDelta)
}