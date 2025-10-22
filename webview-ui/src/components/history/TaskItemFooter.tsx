import React from "react"
import { useTranslation } from "react-i18next"
import type { HistoryItem } from "@roo-code/types"
import { formatTimeAgo } from "@/utils/format"
import { CopyButton } from "./CopyButton"
import { ExportButton } from "./ExportButton"
import { DeleteButton } from "./DeleteButton"
import { FavoriteButton } from "../hoodycode/history/FavoriteButton" // hoodycode_change
import { StandardTooltip } from "../ui/standard-tooltip"
import { vscode } from "@/utils/vscode"

export interface TaskItemFooterProps {
	item: HistoryItem
	variant: "compact" | "full"
	isSelectionMode?: boolean
	onDelete?: (taskId: string) => void
}

const TaskItemFooter: React.FC<TaskItemFooterProps> = ({ item, variant, isSelectionMode = false, onDelete }) => {
	const { t } = useTranslation()
	return (
		<div className="text-xs text-vscode-descriptionForeground flex justify-between items-center">
			<div className="flex gap-2 items-center text-vscode-descriptionForeground/60">
				{/* Datetime with time-ago format */}
				<StandardTooltip content={new Date(item.ts).toLocaleString()}>
					<span className="first-letter:uppercase">{formatTimeAgo(item.ts)}</span>
				</StandardTooltip>
				<span>·</span>
				{/* Cost */}
				{!!item.totalCost && (
					<span className="flex items-center" data-testid="cost-footer-compact">
						{"$" + item.totalCost.toFixed(2)}
					</span>
				)}
				{/* Fork lineage */}
				{item.sourceTaskId && (
					<>
						<span>·</span>
						<button
							className="flex items-center gap-1 text-vscode-descriptionForeground/80 hover:text-vscode-foreground"
							title={t("chat:fork.forkedFrom", { id: item.sourceTaskId })}
							onClick={(e) => {
								e.stopPropagation()
								vscode.postMessage({ type: "showTaskWithId", text: item.sourceTaskId! })
							}}
						>
							<span className="codicon codicon-git-branch scale-90" />
							<span>{t("chat:fork.forkedFrom", { id: item.sourceTaskId.slice(0, 8) })}</span>
						</button>
					</>
				)}
			</div>

			{/* Action Buttons for non-compact view */}
			{!isSelectionMode && (
				<div className="flex flex-row gap-0 items-center text-vscode-descriptionForeground/60 hover:text-vscode-descriptionForeground">
					<CopyButton itemTask={item.task} />
					<FavoriteButton isFavorited={item.isFavorited ?? false} id={item.id} />
					{variant === "full" && <ExportButton itemId={item.id} />}
					{onDelete && <DeleteButton itemId={item.id} onDelete={onDelete} />}
				</div>
			)}
		</div>
	)
}

export default TaskItemFooter
