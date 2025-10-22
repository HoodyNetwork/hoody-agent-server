import {
	useState,
	useEffect,
	// useMemo, // hoodycode_change
} from "react"
// import { Fzf } from "fzf"

// import { highlightFzfMatch } from "@/utils/highlight" // hoodycode_change
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useTaskHistory } from "@/hoodycode/hooks/useTaskHistory"

type SortOption = "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant"

export const useTaskSearch = () => {
	const { taskHistoryFullLength, taskHistoryVersion } = useExtensionState() // hoodycode_change
	const [searchQuery, setSearchQuery] = useState("")
	const [sortOption, setSortOption] = useState<SortOption>("newest")
	const [lastNonRelevantSort, setLastNonRelevantSort] = useState<SortOption | null>("newest")
	const [showAllWorkspaces, setShowAllWorkspaces] = useState(false)

	// hoodycode_change start
	const [requestedPageIndex, setRequestedPageIndex] = useState(0)
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
	const { data } = useTaskHistory(
		{
			workspace: showAllWorkspaces ? "all" : "current",
			sort: sortOption,
			favoritesOnly: showFavoritesOnly,
			pageIndex: requestedPageIndex,
			search: searchQuery,
		},
		taskHistoryVersion,
	)
	// hoodycode_change end

	useEffect(() => {
		if (searchQuery && sortOption !== "mostRelevant" && !lastNonRelevantSort) {
			setLastNonRelevantSort(sortOption)
			setSortOption("mostRelevant")
		} else if (!searchQuery && sortOption === "mostRelevant" && lastNonRelevantSort) {
			setSortOption(lastNonRelevantSort)
			setLastNonRelevantSort(null)
		}
	}, [searchQuery, sortOption, lastNonRelevantSort])

	// hoodycode_change start: logic moved to src/core/hoodycode/webview/getTaskHistory.ts
	//const presentableTasks = useMemo(() => {
	//	const taskHistory = data?.historyItems ?? [] // hoodycode_change
	//	let tasks = taskHistory.filter((item) => item.ts && item.task)
	//	if (!showAllWorkspaces) {
	//		tasks = tasks.filter((item) => item.workspace === cwd)
	//	}
	//	// hoodycode_change start
	//	if (showFavoritesOnly) {
	//		tasks = tasks.filter((item) => item.isFavorited)
	//	}
	//	// hoodycode_change end
	//	return tasks
	//}, [data, showAllWorkspaces, showFavoritesOnly, cwd]) // hoodycode_change
	//
	//const fzf = useMemo(() => {
	//	return new Fzf(presentableTasks, {
	//		selector: (item) => item.task,
	//	})
	//}, [presentableTasks])
	//
	//const tasks = useMemo(() => {
	//	let results = presentableTasks
	//
	//	if (searchQuery) {
	//		const searchResults = fzf.find(searchQuery)
	//		results = searchResults.map((result) => {
	//			const positions = Array.from(result.positions)
	//			const taskEndIndex = result.item.task.length
	//
	//			return {
	//				...result.item,
	//				highlight: highlightFzfMatch(
	//					result.item.task,
	//					positions.filter((p) => p < taskEndIndex),
	//				),
	//				workspace: result.item.workspace,
	//			}
	//		})
	//	}
	//
	//	// Then sort the results
	//	return [...results].sort((a, b) => {
	//		switch (sortOption) {
	//			case "oldest":
	//				return (a.ts || 0) - (b.ts || 0)
	//			case "mostExpensive":
	//				return (b.totalCost || 0) - (a.totalCost || 0)
	//			case "mostTokens":
	//				const aTokens = (a.tokensIn || 0) + (a.tokensOut || 0) + (a.cacheWrites || 0) + (a.cacheReads || 0)
	//				const bTokens = (b.tokensIn || 0) + (b.tokensOut || 0) + (b.cacheWrites || 0) + (b.cacheReads || 0)
	//				return bTokens - aTokens
	//			case "mostRelevant":
	//				// Keep fuse order if searching, otherwise sort by newest
	//				return searchQuery ? 0 : (b.ts || 0) - (a.ts || 0)
	//			case "newest":
	//			default:
	//				return (b.ts || 0) - (a.ts || 0)
	//		}
	//	})
	//}, [presentableTasks, searchQuery, fzf, sortOption])
	// hoodycode_change end

	return {
		tasks: data?.historyItems ?? [], // hoodycode_change
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		lastNonRelevantSort,
		setLastNonRelevantSort,
		showAllWorkspaces,
		setShowAllWorkspaces,
		// hoodycode_change start
		data,
		taskHistoryFullLength,
		showFavoritesOnly,
		setShowFavoritesOnly,
		requestedPageIndex,
		setRequestedPageIndex,
		// hoodycode_change end
	}
}
