edcode = [
	{
		'methodPath': 'eda.dmt_Board.createBoard',
		'description': '创建板子',
		'returns': '板子名称，如若为 `undefined` 则创建失败',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '关联原理图 UUID' },
			{ 'name': 'pcbUuid', 'description': '关联 PCB UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Board.modifyBoardName',
		'description': '修改板子名称',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'originalBoardName', 'description': '原板子名称' },
			{ 'name': 'boardName', 'description': '新板子名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Board.copyBoard',
		'description': '复制板子',
		'returns': '新板子名称，如若为 `undefined` 则复制失败',
		'parameters': [
			{ 'name': 'sourceBoardName', 'description': '源板子名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Board.getBoardInfo',
		'description': '获取板子的详细属性',
		'returns': '板子的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'boardName', 'description': '板子名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Board.getAllBoardsInfo',
		'description': '获取工程内所有板子的详细属性',
		'returns': '所有板子的详细属性的数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Board.getCurrentBoardInfo',
		'description': '获取当前板子的详细属性',
		'returns': '板子的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Board.deleteBoard',
		'description': '删除板子',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'boardName', 'description': '板子名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.openDocument',
		'description': '打开文档',
		'returns': '标签页 ID，如若为 `undefined`，则打开文档失败',
		'parameters': [
			{ 'name': 'documentUuid', 'description': '文档 UUID，此处支持 {@link IDMT_SchematicItem.uuid}、{@link IDMT_SchematicPageItem.uuid}、{@link IDMT_PcbItem.uuid}、{@link IDMT_PanelItem.uuid} 作为输入' },
			{ 'name': 'splitScreenId', 'description': '分屏 ID，即 {@link DMT_EditorControl.getSplitScreenTree} 方法获取到的 {@link IDMT_EditorSplitScreenItem.id}' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.openLibraryDocument',
		'description': '打开库符号、封装文档',
		'returns': '标签页 ID，如若为 `undefined`，则打开文档失败',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'libraryType', 'description': '库类型，支持符号和封装' },
			{ 'name': 'uuid', 'description': '符号、封装 UUID' },
			{ 'name': 'splitScreenId', 'description': '分屏 ID，即 {@link DMT_EditorControl.getSplitScreenTree} 方法获取到的 {@link IDMT_EditorSplitScreenItem.id}' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.closeDocument',
		'description': '关闭文档',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID，此处支持 {@link IDMT_SchematicPageItem.uuid}、{@link IDMT_PcbItem.uuid}、{@link IDMT_PanelItem.uuid} 作为输入' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.getSplitScreenTree',
		'description': '获取编辑器分屏属性树',
		'returns': '编辑器分屏属性树，如若为 `undefined`，则数据获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.getSplitScreenIdByTabId',
		'description': '使用标签页 ID 获取分屏 ID',
		'returns': '分屏 ID',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.getTabsBySplitScreenId',
		'description': '获取指定分屏 ID 下的所有标签页',
		'returns': '标签页列表',
		'parameters': [
			{ 'name': 'splitScreenId', 'description': '分屏 ID' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.createSplitScreen',
		'description': '创建分屏',
		'returns': '分屏 ID，`sourceSplitScreenId` 代表源分屏，`newSplitScreenId` 代表新分屏',
		'parameters': [
			{ 'name': 'splitScreenType', 'description': '分屏类型，`horizontal` 水平、`vertical` 垂直' },
			{ 'name': 'tabId', 'description': '标签页 ID，该标签页将会被移入新的分屏中' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.moveDocumentToSplitScreen',
		'description': '将文档移动到指定分屏',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID' },
			{ 'name': 'splitScreenId', 'description': '{@link IDMT_EditorSplitScreenItem.id | 分屏 ID}' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.activateDocument',
		'description': '激活文档',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.activateSplitScreen',
		'description': '激活分屏',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'splitScreenId', 'description': '分屏 ID' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.tileAllDocumentToSplitScreen',
		'description': '平铺所有文档',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.mergeAllDocumentFromSplitScreen',
		'description': '合并所有分屏',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.getCurrentRenderedAreaImage',
		'description': '获取画布渲染区域图像',
		'returns': '- 画布渲染区域的 Blob 格式图像数据',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则获取最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.zoomToRegion',
		'description': '缩放到区域',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'left', 'description': '矩形框第一 X 坐标' },
			{ 'name': 'right', 'description': '矩形框第二 X 坐标' },
			{ 'name': 'top', 'description': '矩形框第一 Y 坐标' },
			{ 'name': 'bottom', 'description': '矩形框第二 Y 坐标' },
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则为最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.zoomTo',
		'description': '缩放到坐标',
		'returns': '缩放到的区域数据，`false` 表示画布不支持该缩放操作或 `tabId` 不存在',
		'parameters': [
			{ 'name': 'x', 'description': '中心坐标 X，如若不传入则不改变当前 X 坐标' },
			{ 'name': 'y', 'description': '中心坐标 Y，如若不传入则不改变当前 Y 坐标' },
			{ 'name': 'scaleRatio', 'description': '缩放比，如若不传入则不改变当前缩放比，单位跨度为 `1/100`，如若传入 `200`，则表示缩放比为 `200%`' },
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则为最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.zoomToAllPrimitives',
		'description': '缩放到所有图元（适应全部）',
		'returns': '缩放到的区域数据，`false` 表示画布不支持该缩放操作或 `tabId` 不存在',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则为最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.zoomToSelectedPrimitives',
		'description': '缩放到已选中图元（适应选中）',
		'returns': '缩放到的区域数据，`false` 表示画布不支持该缩放操作或 `tabId` 不存在',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则为最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.generateIndicatorMarkers',
		'description': '生成指示标记',
		'returns': '指示标记生成是否成功，`false` 表示画布不支持该操作或 `tabId` 不存在',
		'parameters': [
			{ 'name': 'markers', 'description': '指示标记外形对象数组' },
			{ 'name': 'color', 'description': '指示标记颜色' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'zoom', 'description': '是否定位并缩放' },
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则为最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_EditorControl.removeIndicatorMarkers',
		'description': '移除指示标记',
		'returns': '指示标记移除是否成功，`false` 表示画布不支持该操作或 `tabId` 不存在',
		'parameters': [
			{ 'name': 'tabId', 'description': '标签页 ID，如若未传入，则为最后输入焦点的画布' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.createFolder',
		'description': '创建文件夹',
		'returns': '文件夹 UUID，如若为 `undefined` 则创建失败',
		'parameters': [
			{ 'name': 'folderName', 'description': '文件夹名称' },
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'parentFolderUuid', 'description': '父文件夹 UUID，如若不指定，则为根文件夹' },
			{ 'name': 'description', 'description': '文件夹描述' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.modifyFolderName',
		'description': '修改文件夹名称',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID' },
			{ 'name': 'folderName', 'description': '文件夹名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.modifyFolderDescription',
		'description': '修改文件夹描述',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID' },
			{ 'name': 'description', 'description': '文件夹描述，如若为 `undefined` 则清空工程现有描述' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.moveFolderToFolder',
		'description': '移动文件夹',
		'returns': '是否移动成功',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID' },
			{ 'name': 'parentFolderUuid', 'description': '父文件夹 UUID，如若不指定，则默认为根文件夹' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.getAllFoldersUuid',
		'description': '获取所有文件夹的 UUID',
		'returns': '文件夹 UUID 数组',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.getFolderInfo',
		'description': '获取文件夹详细属性',
		'returns': '文件夹属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Folder.deleteFolder',
		'description': '删除文件夹',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.createPanel',
		'description': '创建面板',
		'returns': '面板 UUID，如若为 `undefined` 则创建失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.modifyPanelName',
		'description': '修改面板名称',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'panelUuid', 'description': '面板 UUID' },
			{ 'name': 'panelName', 'description': '面板名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.copyPanel',
		'description': '复制面板',
		'returns': '新面板 UUID，如若为 `undefined` 则复制失败',
		'parameters': [
			{ 'name': 'panelUuid', 'description': '源面板 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.getPanelInfo',
		'description': '获取面板的详细属性',
		'returns': '面板的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'panelUuid', 'description': '面板 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.getAllPanelsInfo',
		'description': '获取工程内所有面板的详细属性',
		'returns': '所有面板的详细属性的数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.getCurrentPanelInfo',
		'description': '获取当前面板的详细属性',
		'returns': '面板的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Panel.deletePanel',
		'description': '删除面板',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'panelUuid', 'description': '面板 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.createPcb',
		'description': '创建 PCB',
		'returns': 'PCB UUID，如若为 `undefined` 则创建失败',
		'parameters': [
			{ 'name': 'boardName', 'description': '所属板子名称，如若不指定则为游离 PCB' },
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.modifyPcbName',
		'description': '修改 PCB 名称',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'pcbUuid', 'description': 'PCB UUID' },
			{ 'name': 'pcbName', 'description': 'PCB 名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.copyPcb',
		'description': '复制 PCB',
		'returns': '新 PCB UUID，如若为 `undefined` 则复制失败',
		'parameters': [
			{ 'name': 'pcbUuid', 'description': '源 PCB UUID' },
			{ 'name': 'boardName', 'description': '新 PCB 所属板子名称，如若不指定则为游离 PCB' },
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.getPcbInfo',
		'description': '获取 PCB 的详细属性',
		'returns': 'PCB 的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'pcbUuid', 'description': 'PCB UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.getAllPcbsInfo',
		'description': '获取工程内所有 PCB 的详细属性',
		'returns': '所有 PCB 的详细属性的数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.getCurrentPcbInfo',
		'description': '获取当前 PCB 的详细属性',
		'returns': 'PCB 的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Pcb.deletePcb',
		'description': '删除 PCB',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'pcbUuid', 'description': 'PCB UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Project.openProject',
		'description': '打开工程',
		'returns': '是否成功打开工程',
		'parameters': [
			{ 'name': 'projectUuid', 'description': '工程 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Project.createProject',
		'description': '创建工程',
		'returns': '工程 UUID，如若为 `undefined` 则创建失败',
		'parameters': [
			{ 'name': 'projectFriendlyName', 'description': '工程友好名称' },
			{ 'name': 'projectName', 'description': '工程名称，不可重复，仅支持字母 `a-zA-Z`、数字 `0-9`、中划线 `-`，如若不指定，则根据工程友好名称自动生成' },
			{ 'name': 'teamUuid', 'description': '团队 UUID，如若不指定，则默认为个人；在不存在个人工程的环境下必须指定团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID，如若不指定，则为根文件夹' },
			{ 'name': 'description', 'description': '工程描述' },
			{ 'name': 'collaborationMode', 'description': '工程协作模式，如若团队权限无需工程设置协作模式，则该参数将被忽略' },
		],
	},
	{
		'methodPath': 'eda.dmt_Project.moveProjectToFolder',
		'description': '移动工程到文件夹',
		'returns': '是否移动成功',
		'parameters': [
			{ 'name': 'projectUuid', 'description': '工程 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID，只能为当前工程所在团队或个人下的文件夹，如若为 `undefined` 则移动到当前团队的根文件夹' },
		],
	},
	{
		'methodPath': 'eda.dmt_Project.getAllProjectsUuid',
		'description': '获取所有工程的 UUID',
		'returns': '工程 UUID 数组',
		'parameters': [
			{ 'name': 'teamUuid', 'description': '团队 UUID' },
			{ 'name': 'folderUuid', 'description': '文件夹 UUID，如若不指定，则默认为团队的根文件夹' },
			{ 'name': 'workspaceUuid', 'description': '工作区 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Project.getProjectInfo',
		'description': '获取工程属性',
		'returns': '简略的工程属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'projectUuid', 'description': '工程 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Project.getCurrentProjectInfo',
		'description': '获取当前工程的详细属性',
		'returns': '工程属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.createSchematic',
		'description': '创建原理图',
		'returns': '原理图 UUID，如若为 `undefined` 则创建失败',
		'parameters': [
			{ 'name': 'boardName', 'description': '所属板子名称，如若不指定则为游离原理图' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.createSchematicPage',
		'description': '创建原理图图页',
		'returns': '原理图图页 UUID，如若为 `undefined` 则创建失败',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '所属原理图 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.modifySchematicName',
		'description': '修改原理图名称',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '原理图 UUID' },
			{ 'name': 'schematicName', 'description': '原理图名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.modifySchematicPageName',
		'description': '修改原理图图页名称',
		'returns': '是否修改成功',
		'parameters': [
			{ 'name': 'schematicPageUuid', 'description': '原理图图页 UUID' },
			{ 'name': 'schematicPageName', 'description': '原理图图页名称' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.modifySchematicPageTitleBlock',
		'description': '修改原理图图页明细表',
		'returns': '修改操作是否成功，如若未传入 `showTitleBlock` 和 `titleBlockData` 将返回 `false`；请注意，如若存在无法识别的明细项但程序并未出错，将返回 `true` 的结果，因为无法识别的明细项被忽略',
		'parameters': [
			{ 'name': 'showTitleBlock', 'description': '是否显示明细表，不定义将保持当前状态' },
			{ 'name': 'titleBlockData', 'description': '需要修改的明细项及其修改的值' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.copySchematic',
		'description': '复制原理图',
		'returns': '新原理图 UUID，如若为 `undefined` 则复制失败',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '源原理图 UUID' },
			{ 'name': 'boardName', 'description': '新原理图所属板子名称，如若不指定则为游离原理图' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.copySchematicPage',
		'description': '复制原理图图页',
		'returns': '新原理图图页 UUID，如若为 `undefined` 则复制失败',
		'parameters': [
			{ 'name': 'schematicPageUuid', 'description': '源原理图图页 UUID' },
			{ 'name': 'schematicUuid', 'description': '目标原理图 UUID，如若不指定则为当前原理图' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getSchematicInfo',
		'description': '获取原理图的详细属性',
		'returns': '原理图的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '原理图 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getSchematicPageInfo',
		'description': '获取原理图图页的详细属性',
		'returns': '原理图图页的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
			{ 'name': 'schematicPageUuid', 'description': '原理图图页 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getAllSchematicsInfo',
		'description': '获取工程内所有原理图的详细属性',
		'returns': '所有原理图的详细属性的数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getAllSchematicPagesInfo',
		'description': '获取工程内所有原理图图页的详细属性',
		'returns': '所有原理图图页的详细属性的数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getCurrentSchematicAllSchematicPagesInfo',
		'description': '获取当前原理图内所有原理图图页的详细属性',
		'returns': '所有原理图图页的详细属性的数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getCurrentSchematicInfo',
		'description': '获取当前原理图的详细属性',
		'returns': '原理图的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.getCurrentSchematicPageInfo',
		'description': '获取当前原理图图页的详细属性',
		'returns': '原理图图页的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.reorderSchematicPages',
		'description': '重新排序原理图图页',
		'returns': '排序操作是否成功',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '执行排序的图页所关联的原理图 UUID' },
			{ 'name': 'schematicPageItemsArray', 'description': '所有原理图图页属性的数组' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.deleteSchematic',
		'description': '删除原理图',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'schematicUuid', 'description': '原理图 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_Schematic.deleteSchematicPage',
		'description': '删除原理图图页',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'schematicPageUuid', 'description': '原理图图页 UUID' },
		],
	},
	{
		'methodPath': 'eda.dmt_SelectControl.getCurrentDocumentInfo',
		'description': '获取当前文档的属性',
		'returns': '文档类型、UUID、所属工程的 UUID、所属库的 UUID 组成的对象，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Team.getAllTeamsInfo',
		'description': '获取所有直接团队的详细属性',
		'returns': '所有团队的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Team.getAllInvolvedTeamInfo',
		'description': '获取所有参与的团队的详细属性',
		'returns': '所有参与的团队的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Team.getCurrentTeamInfo',
		'description': '获取当前团队的详细属性',
		'returns': '团队的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Workspace.getAllWorkspacesInfo',
		'description': '获取所有工作区的详细属性',
		'returns': '所有工作区的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.dmt_Workspace.toggleToWorkspace',
		'description': '切换到工作区',
		'returns': '切换操作是否成功',
		'parameters': [
			{ 'name': 'workspaceUuid', 'description': '工作区 UUID，如若不指定，则将切换到个人工作区' },
		],
	},
	{
		'methodPath': 'eda.dmt_Workspace.getCurrentWorkspaceInfo',
		'description': '获取当前工作区的详细属性',
		'returns': '工作区的详细属性，如若为 `undefined` 则获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_ComplexPolygon.addSource',
		'description': '添加多边形数据',
		'returns': '复杂多边形对象',
		'parameters': [
			{ 'name': 'complexPolygon', 'description': '复杂多边形数据' },
		],
	},
	{
		'methodPath': 'eda.ipcb_ComplexPolygon.getSource',
		'description': '获取多边形数据',
		'returns': '单多边形或复杂多边形数据',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_ComplexPolygon.getSourceStrictComplex',
		'description': '获取复杂多边形数据',
		'returns': '复杂多边形数据',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_Polygon.getSource',
		'description': '获取单多边形数据',
		'returns': '单多边形数据',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_StartX',
		'description': '获取属性状态：起始位置 X',
		'returns': '起始位置 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_StartY',
		'description': '获取属性状态：起始位置 Y',
		'returns': '起始位置 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_EndX',
		'description': '获取属性状态：终止位置 X',
		'returns': '终止位置 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_EndY',
		'description': '获取属性状态：终止位置 Y',
		'returns': '终止位置 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_ArcAngle',
		'description': '获取属性状态：圆弧角度',
		'returns': '圆弧角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_InteractiveMode',
		'description': '获取属性状态：交互模式',
		'returns': '交互模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_StartX',
		'description': '设置属性状态：起始位置 X',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'startX', 'description': '起始位置 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_StartY',
		'description': '设置属性状态：起始位置 Y',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'startY', 'description': '起始位置 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_EndX',
		'description': '设置属性状态：终止位置 X',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'endX', 'description': '终止位置 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_EndY',
		'description': '设置属性状态：终止位置 Y',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'endY', 'description': '终止位置 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_ArcAngle',
		'description': '设置属性状态：圆弧角度',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'arcAngle', 'description': '圆弧角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_InteractiveMode',
		'description': '设置属性状态：交互模式',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'interactiveMode', 'description': '交互模式' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.toSync',
		'description': '将图元转换为同步图元',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.done',
		'description': '将对图元的更改应用到画布',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getAdjacentPrimitives',
		'description': '获取相邻的图元对象',
		'returns': '相邻的直线、过孔、圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getEntireTrack',
		'description': '获取整段导线',
		'returns': '整段导线内的所有直线和圆弧线',
		'parameters': [
			{ 'name': 'includeVias', 'description': '是否包含导线两端的过孔' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveArc.getEntireTrack',
		'description': '获取整段导线',
		'returns': '整段导线内的所有直线、圆弧线，以及两端连接的过孔（如果有）',
		'parameters': [
			{ 'name': 'includeVias', 'description': '是否包含导线两端的过孔' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_ParentPrimitiveId',
		'description': '获取属性状态：关联的父图元 ID',
		'returns': '关联的父图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Key',
		'description': '获取属性状态：Key',
		'returns': 'Key',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Value',
		'description': '获取属性状态：Value',
		'returns': 'Value',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_KeyVisible',
		'description': '获取属性状态：Key 是否可见',
		'returns': 'Key 是否可见',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_ValueVisible',
		'description': '获取属性状态：Value 是否可见',
		'returns': 'Value 是否可见',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_FontFamily',
		'description': '获取属性状态：字体',
		'returns': '字体',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_FontSize',
		'description': '获取属性状态：字号',
		'returns': '字号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_AlignMode',
		'description': '获取属性状态：对齐模式',
		'returns': '对齐模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Reverse',
		'description': '获取属性状态：是否反相',
		'returns': '是否反相',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Expansion',
		'description': '获取属性状态：反相扩展',
		'returns': '反相扩展',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_Mirror',
		'description': '获取属性状态：是否镜像',
		'returns': '是否镜像',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Key',
		'description': '设置属性状态：Key',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'key', 'description': 'Key' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Value',
		'description': '设置属性状态：Value',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'value', 'description': 'Value' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_KeyVisible',
		'description': '设置属性状态：Key 是否可见',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'keyVisible', 'description': 'Key 是否可见' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_ValueVisible',
		'description': '设置属性状态：Value 是否可见',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'valueVisible', 'description': 'Value 是否可见' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_FontFamily',
		'description': '设置属性状态：字体',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'fontFamily', 'description': '字体' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_FontSize',
		'description': '设置属性状态：字号',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'fontSize', 'description': '字号' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_AlignMode',
		'description': '设置属性状态：对齐模式',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'alignMode', 'description': '对齐模式' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Reverse',
		'description': '设置属性状态：是否反相',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'reverse', 'description': '是否反相' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Expansion',
		'description': '设置属性状态：反相扩展',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'expansion', 'description': '反相扩展' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_Mirror',
		'description': '设置属性状态：是否镜像',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '属性图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '属性图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.toSync',
		'description': '将图元转换为同步图元',
		'returns': '属性图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveAttribute.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Component',
		'description': '获取属性状态：关联库器件',
		'returns': '关联库器件',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Footprint',
		'description': '获取属性状态：关联库封装',
		'returns': '关联库封装',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_AddIntoBom',
		'description': '获取属性状态：是否加入 BOM',
		'returns': '是否加入 BOM',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Model3D',
		'description': '获取属性状态：关联库 3D 模型',
		'returns': '关联库 3D 模型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Designator',
		'description': '获取属性状态：位号',
		'returns': '位号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Pads',
		'description': '获取属性状态：焊盘',
		'returns': '焊盘',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Name',
		'description': '获取属性状态：名称',
		'returns': '名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_UniqueId',
		'description': '获取属性状态：唯一 ID',
		'returns': '唯一 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Manufacturer',
		'description': '获取属性状态：制造商',
		'returns': '制造商',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_ManufacturerId',
		'description': '获取属性状态：制造商编号',
		'returns': '制造商编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_Supplier',
		'description': '获取属性状态：供应商',
		'returns': '供应商',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_SupplierId',
		'description': '获取属性状态：供应商编号',
		'returns': '供应商编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getState_OtherProperty',
		'description': '获取属性状态：其它参数',
		'returns': '其它参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_AddIntoBom',
		'description': '设置属性状态：是否加入 BOM',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Designator',
		'description': '设置属性状态：位号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'designator', 'description': '位号' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Name',
		'description': '设置属性状态：名称',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'name', 'description': '名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_UniqueId',
		'description': '设置属性状态：唯一 ID',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'uniqueId', 'description': '唯一 ID' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Manufacturer',
		'description': '设置属性状态：制造商',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'manufacturer', 'description': '制造商' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_ManufacturerId',
		'description': '设置属性状态：制造商编号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'manufacturerId', 'description': '制造商编号' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_Supplier',
		'description': '设置属性状态：供应商',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'supplier', 'description': '供应商' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_SupplierId',
		'description': '设置属性状态：供应商编号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'supplierId', 'description': '供应商编号' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.setState_OtherProperty',
		'description': '设置属性状态：其它参数',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'otherProperty', 'description': '其它参数' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.toSync',
		'description': '将图元转换为同步图元',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.done',
		'description': '将对图元的更改应用到画布',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponent.getAllPins',
		'description': '获取器件关联的所有焊盘',
		'returns': '器件焊盘图元数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveComponentPad.done',
		'description': '将对图元的更改应用到画布',
		'returns': '器件焊盘图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_DimensionType',
		'description': '获取属性状态：尺寸标注类型',
		'returns': '尺寸标注类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_CoordinateSet',
		'description': '获取属性状态：坐标集',
		'returns': '坐标集',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_Unit',
		'description': '获取属性状态：单位',
		'returns': '单位',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_Precision',
		'description': '获取属性状态：精度',
		'returns': '精度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_TextFollow',
		'description': '获取属性状态：文字跟随',
		'returns': '文字跟随',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_DimensionType',
		'description': '设置属性状态：尺寸标注类型',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'dimensionType', 'description': '尺寸标注类型' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_CoordinateSet',
		'description': '设置属性状态：坐标集',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'coordinateSet', 'description': '坐标集' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_Unit',
		'description': '设置属性状态：单位',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'unit', 'description': '单位' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_Precision',
		'description': '设置属性状态：精度',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'precision', 'description': '精度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '尺寸标注图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.toSync',
		'description': '将图元转换为同步图元',
		'returns': '尺寸标注图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '尺寸标注图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveDimension.done',
		'description': '将对图元的更改应用到画布',
		'returns': '尺寸标注图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_ComplexPolygon',
		'description': '获取属性状态：复杂多边形',
		'returns': '复杂多边形',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_FillMode',
		'description': '获取属性状态：填充模式',
		'returns': '填充模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.setState_ComplexPolygon',
		'description': '设置属性状态：复杂多边形',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'complexPolygon', 'description': '复杂多边形' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.setState_FillMode',
		'description': '设置属性状态：填充模式',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'fillMode', 'description': '填充模式' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.toSync',
		'description': '将图元转换为同步图元',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.done',
		'description': '将对图元的更改应用到画布',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.convertToPolyline',
		'description': '转换到：折线图元',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.convertToPour',
		'description': '转换到：覆铜边框图元',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveFill.convertToRegion',
		'description': '转换到：区域图元(默认是禁止区域)',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_X',
		'description': '获取属性状态：BBox 左上点坐标 X',
		'returns': 'BBox 左上点坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_Y',
		'description': '获取属性状态：BBox 左上点坐标 Y',
		'returns': 'BBox 左上点坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_ComplexPolygon',
		'description': '获取属性状态：图像源数据（复杂多边形）',
		'returns': '图像源数据（复杂多边形）',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_Width',
		'description': '获取属性状态：宽',
		'returns': '宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_Height',
		'description': '获取属性状态：高',
		'returns': '高',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_HorizonMirror',
		'description': '获取属性状态：是否水平镜像',
		'returns': '是否水平镜像',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_X',
		'description': '设置属性状态：BBox 左上点坐标 X',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'x', 'description': 'BBox 左上点坐标 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_Y',
		'description': '设置属性状态：BBox 左上点坐标 Y',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'y', 'description': 'BBox 左上点坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_Width',
		'description': '设置属性状态：宽',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'width', 'description': '宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_Height',
		'description': '设置属性状态：高',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'height', 'description': '高' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_HorizonMirror',
		'description': '设置属性状态：是否水平镜像',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'horizonMirror', 'description': '是否水平镜像' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '图像图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.toSync',
		'description': '将图元转换为同步图元',
		'returns': '图像图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '图像图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveImage.done',
		'description': '将对图元的更改应用到画布',
		'returns': '图像图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_StartX',
		'description': '获取属性状态：起始位置 X',
		'returns': '起始位置 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_StartY',
		'description': '获取属性状态：起始位置 Y',
		'returns': '起始位置 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_EndX',
		'description': '获取属性状态：终止位置 X',
		'returns': '终止位置 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_EndY',
		'description': '获取属性状态：终止位置 Y',
		'returns': '终止位置 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_StartX',
		'description': '设置属性状态：起始位置 X',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'startX', 'description': '起始位置 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_StartY',
		'description': '设置属性状态：起始位置 Y',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'startY', 'description': '起始位置 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_EndX',
		'description': '设置属性状态：终止位置 X',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'endX', 'description': '终止位置 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_EndY',
		'description': '设置属性状态：终止位置 Y',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'endY', 'description': '终止位置 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '直线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.toSync',
		'description': '将图元转换为同步图元',
		'returns': '直线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '直线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.done',
		'description': '将对图元的更改应用到画布',
		'returns': '直线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getAdjacentPrimitives',
		'description': '获取相邻的图元对象',
		'returns': '相邻的直线、过孔、圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getEntireTrack',
		'description': '获取整段导线',
		'returns': '整段导线内的所有直线和圆弧线',
		'parameters': [
			{ 'name': 'includeVias', 'description': '是否包含导线两端的过孔' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveLine.getEntireTrack',
		'description': '获取整段导线',
		'returns': '整段导线内的所有直线、圆弧线，以及两端连接的过孔（如果有）',
		'parameters': [
			{ 'name': 'includeVias', 'description': '是否包含导线两端的过孔' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_TopLeftX',
		'description': '获取属性状态：左上点 X',
		'returns': '左上点 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_TopLeftY',
		'description': '获取属性状态：左上点 Y',
		'returns': '左上点 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_BinaryData',
		'description': '获取属性状态：二进制数据',
		'returns': '二进制数据',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_Width',
		'description': '获取属性状态：宽',
		'returns': '宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_Height',
		'description': '获取属性状态：高',
		'returns': '高',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_Mirror',
		'description': '获取属性状态：是否水平镜像',
		'returns': '是否水平镜像',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_FileName',
		'description': '获取属性状态：文件名',
		'returns': '文件名',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_TopLeftX',
		'description': '设置属性状态：左上点 X',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'topLeftX', 'description': '左上点 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_TopLeftY',
		'description': '设置属性状态：左上点 Y',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'topLeftY', 'description': '左上点 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_BinaryData',
		'description': '设置属性状态：二进制数据',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'binaryData', 'description': '二进制数据' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_Width',
		'description': '设置属性状态：宽',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'width', 'description': '宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_Height',
		'description': '设置属性状态：高',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'height', 'description': '高' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_Mirror',
		'description': '设置属性状态：是否水平镜像',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'mirror', 'description': '是否水平镜像' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_FileName',
		'description': '设置属性状态：文件名',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.toSync',
		'description': '将图元转换为同步图元',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveObject.done',
		'description': '将对图元的更改应用到画布',
		'returns': '二进制内嵌对象图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.create',
		'description': '在 PCB 画布中创建图元',
		'returns': '焊盘图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_PadNumber',
		'description': '获取属性状态：焊盘编号',
		'returns': '焊盘编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_X',
		'description': '获取属性状态：位置 X',
		'returns': '位置 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Y',
		'description': '获取属性状态：位置 Y',
		'returns': '位置 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Pad',
		'description': '获取属性状态：焊盘外形',
		'returns': '焊盘外形',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Hole',
		'description': '获取属性状态：孔',
		'returns': '孔',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_HoleOffsetX',
		'description': '获取属性状态：孔偏移 X',
		'returns': '孔偏移 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_HoleOffsetY',
		'description': '获取属性状态：孔偏移 Y',
		'returns': '孔偏移 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_HoleRotation',
		'description': '获取属性状态：孔相对于焊盘的旋转角度',
		'returns': '孔相对于焊盘的旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_Metallization',
		'description': '获取属性状态：是否金属化孔壁',
		'returns': '是否金属化孔壁',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_PadType',
		'description': '获取属性状态：焊盘类型',
		'returns': '焊盘类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_SpecialPad',
		'description': '获取属性状态：特殊焊盘外形',
		'returns': '特殊焊盘外形',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_SolderMaskAndPasteMaskExpansion',
		'description': '获取属性状态：阻焊/助焊扩展',
		'returns': '阻焊/助焊扩展',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_HeatWelding',
		'description': '获取属性状态：热焊优化参数',
		'returns': '热焊优化参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_PadNumber',
		'description': '设置属性状态：焊盘编号',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'padNumber', 'description': '焊盘编号' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_X',
		'description': '设置属性状态：位置 X',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '位置 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Y',
		'description': '设置属性状态：位置 Y',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '位置 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Pad',
		'description': '设置属性状态：焊盘外形',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'pad', 'description': '焊盘外形' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Net',
		'description': '设置属性状态：网络',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Hole',
		'description': '设置属性状态：孔',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'hole', 'description': '焊盘钻孔' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_HoleOffsetX',
		'description': '设置属性状态：孔偏移 X',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'holeOffsetX', 'description': '孔偏移 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_HoleOffsetY',
		'description': '设置属性状态：孔偏移 Y',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'holeOffsetY', 'description': '孔偏移 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_HoleRotation',
		'description': '设置属性状态：孔相对于焊盘的旋转角度',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'holeRotation', 'description': '孔相对于焊盘的旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_Metallization',
		'description': '设置属性状态：是否金属化孔壁',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'metallization', 'description': '是否金属化孔壁' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_SpecialPad',
		'description': '设置属性状态：特殊焊盘外形',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'pad', 'description': '特殊焊盘外形' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_SolderMaskAndPasteMaskExpansion',
		'description': '设置属性状态：阻焊/助焊扩展',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'solderMaskAndPasteMaskExpansion', 'description': '阻焊/助焊扩展' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_HeatWelding',
		'description': '设置属性状态：热焊优化参数',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'heatWelding', 'description': '热焊优化参数' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '焊盘图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.toSync',
		'description': '将图元转换为同步图元',
		'returns': '焊盘图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '焊盘图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePad.done',
		'description': '将对图元的更改应用到画布',
		'returns': '尺寸标注图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_Polygon',
		'description': '获取属性状态：单多边形',
		'returns': '单多边形',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.setState_Polygon',
		'description': '设置属性状态：单多边形',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'polygon', 'description': '单多边形' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.toSync',
		'description': '将图元转换为同步图元',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.done',
		'description': '将对图元的更改应用到画布',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.convertToFill',
		'description': '转换到：填充图元',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.convertToPour',
		'description': '转换到：覆铜边框图元',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePolyline.convertToRegion',
		'description': '转换到：区域图元',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_ComplexPolygon',
		'description': '获取属性状态：复杂多边形',
		'returns': '复杂多边形',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PourFillMethod',
		'description': '获取属性状态：覆铜填充方法',
		'returns': '覆铜填充方法',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PreserveSilos',
		'description': '获取属性状态：是否保留孤岛',
		'returns': '是否保留孤岛',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PourName',
		'description': '获取属性状态：覆铜边框名称',
		'returns': '覆铜边框名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PourPriority',
		'description': '获取属性状态：覆铜优先级',
		'returns': '覆铜优先级',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_ComplexPolygon',
		'description': '设置属性状态：复杂多边形',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'complexPolygon', 'description': '复杂多边形' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_PourFillMethod',
		'description': '设置属性状态：覆铜填充方法',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'pourFillMethod', 'description': '覆铜填充方法' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_PreserveSilos',
		'description': '设置属性状态：是否保留孤岛',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'preserveSilos', 'description': '是否保留孤岛' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_PourName',
		'description': '设置属性状态：覆铜边框名称',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'pourName', 'description': '覆铜边框名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_PourPriority',
		'description': '设置属性状态：覆铜优先级',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'pourPriority', 'description': '覆铜优先级' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.toSync',
		'description': '将图元转换为同步图元',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.done',
		'description': '将对图元的更改应用到画布',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.convertToFill',
		'description': '转换到：填充图元(默认是填充区域)',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.convertToPolyline',
		'description': '转换到：折线图元(默认是线条)',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePour.convertToRegion',
		'description': '转换到：区域图元(默认是禁止区域)',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePoured.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePoured.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePoured.getState_PourPrimitiveId',
		'description': '获取属性状态：覆铜边框图元 ID',
		'returns': '覆铜边框图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitivePoured.getState_PourFills',
		'description': '获取属性状态：覆铜填充区域',
		'returns': '覆铜填充区域',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_ComplexPolygon',
		'description': '获取属性状态：复杂多边形',
		'returns': '复杂多边形',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_RuleType',
		'description': '获取属性状态：区域规则类型',
		'returns': '区域规则类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_RegionName',
		'description': '获取属性状态：区域名称',
		'returns': '区域名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.setState_ComplexPolygon',
		'description': '设置属性状态：复杂多边形',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'complexPolygon', 'description': '复杂多边形' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.setState_RuleType',
		'description': '设置属性状态：区域规则类型',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'ruleType', 'description': '区域规则类型' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.setState_RegionName',
		'description': '设置属性状态：区域名称',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'regionName', 'description': '区域名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.toSync',
		'description': '将图元转换为同步图元',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.done',
		'description': '将对图元的更改应用到画布',
		'returns': '区域图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.convertToFill',
		'description': '转换到：填充图元',
		'returns': '填充图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.convertToPolyline',
		'description': '转换到：折线图元',
		'returns': '折线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveRegion.convertToPour',
		'description': '转换到：覆铜边框图元',
		'returns': '覆铜边框图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Layer',
		'description': '获取属性状态：层',
		'returns': '层',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Text',
		'description': '获取属性状态：文本内容',
		'returns': '文本内容',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_FontFamily',
		'description': '获取属性状态：字体',
		'returns': '字体',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_FontSize',
		'description': '获取属性状态：字号',
		'returns': '字号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_AlignMode',
		'description': '获取属性状态：对齐模式',
		'returns': '对齐模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Reverse',
		'description': '获取属性状态：是否反相',
		'returns': '是否反相',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Expansion',
		'description': '获取属性状态：反相扩展',
		'returns': '反相扩展',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_Mirror',
		'description': '获取属性状态：是否镜像',
		'returns': '是否镜像',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Layer',
		'description': '设置属性状态：层',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Text',
		'description': '设置属性状态：文本内容',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'text', 'description': '文本内容' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_FontFamily',
		'description': '设置属性状态：字体',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'fontFamily', 'description': '字体' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_FontSize',
		'description': '设置属性状态：字号',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'fontSize', 'description': '字号' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_AlignMode',
		'description': '设置属性状态：对齐模式',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'alignMode', 'description': '对齐模式' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Reverse',
		'description': '设置属性状态：是否反相',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'reverse', 'description': '是否反相' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Expansion',
		'description': '设置属性状态：反相扩展',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'expansion', 'description': '反相扩展' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_Mirror',
		'description': '设置属性状态：是否镜像',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '文本图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.toSync',
		'description': '将图元转换为同步图元',
		'returns': '文本图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveString.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_HoleDiameter',
		'description': '获取属性状态：孔径',
		'returns': '孔径',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_Diameter',
		'description': '获取属性状态：外径',
		'returns': '外径',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_ViaType',
		'description': '获取属性状态：过孔类型',
		'returns': '过孔类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_DesignRuleBlindViaName',
		'description': '获取属性状态：盲埋孔设计规则项名称',
		'returns': '盲埋孔设计规则项名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_SolderMaskExpansion',
		'description': '获取属性状态：阻焊/助焊扩展',
		'returns': '阻焊/助焊扩展',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getState_PrimitiveLock',
		'description': '获取属性状态：是否锁定',
		'returns': '是否锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_HoleDiameter',
		'description': '设置属性状态：孔径',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'holeDiameter', 'description': '孔径' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_Diameter',
		'description': '设置属性状态：外径',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'diameter', 'description': '外径' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_ViaType',
		'description': '设置属性状态：过孔类型',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'viaType', 'description': '过孔类型' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_DesignRuleBlindViaName',
		'description': '设置属性状态：盲埋孔设计规则项名称',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'designRuleBlindViaName', 'description': '盲埋孔设计规则项名称' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_SolderMaskExpansion',
		'description': '设置属性状态：阻焊/助焊扩展',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'solderMaskExpansion', 'description': '阻焊/助焊扩展' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.setState_PrimitiveLock',
		'description': '设置属性状态：是否锁定',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '过孔图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.toSync',
		'description': '将图元转换为同步图元',
		'returns': '过孔图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '过孔图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.done',
		'description': '将对图元的更改应用到画布',
		'returns': '过孔图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.ipcb_PrimitiveVia.getAdjacentPrimitives',
		'description': '获取相邻的图元对象',
		'returns': '相邻的导线、圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_StartX',
		'description': '获取属性状态：起始点 X',
		'returns': '起始点 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_StartY',
		'description': '获取属性状态：起始点 Y',
		'returns': '起始点 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_ReferenceX',
		'description': '获取属性状态：参考点 X',
		'returns': '参考点 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_ReferenceY',
		'description': '获取属性状态：参考点 Y',
		'returns': '参考点 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_EndX',
		'description': '获取属性状态：终止点 X',
		'returns': '终止点 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_EndY',
		'description': '获取属性状态：终止点 Y',
		'returns': '终止点 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_Color',
		'description': '获取属性状态：颜色',
		'returns': '颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_FillColor',
		'description': '获取属性状态：填充颜色',
		'returns': '填充颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.getState_LineType',
		'description': '获取属性状态：线型',
		'returns': '线型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_StartX',
		'description': '设置属性状态：起始点 X',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'startX', 'description': '起始点 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_StartY',
		'description': '设置属性状态：起始点 Y',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'startY', 'description': '起始点 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_ReferenceX',
		'description': '设置属性状态：参考点 X',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'referenceX', 'description': '参考点 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_ReferenceY',
		'description': '设置属性状态：参考点 Y',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'referenceY', 'description': '参考点 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_EndX',
		'description': '设置属性状态：终止点 X',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'endX', 'description': '终止点 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_EndY',
		'description': '设置属性状态：终止点 Y',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'endY', 'description': '终止点 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_Color',
		'description': '设置属性状态：颜色',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'color', 'description': '颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_FillColor',
		'description': '设置属性状态：填充颜色',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'fillColor', 'description': '填充颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.setState_LineType',
		'description': '设置属性状态：线型',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'lineType', 'description': '线型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '圆弧图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.toSync',
		'description': '将图元转换为同步图元',
		'returns': '圆弧图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '圆弧图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveArc.done',
		'description': '将对图元的更改应用到画布',
		'returns': '圆弧图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_BusName',
		'description': '获取属性状态：总线名称',
		'returns': '总线名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_Line',
		'description': '获取属性状态：多段线坐标组',
		'returns': '多段线坐标组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_Color',
		'description': '获取属性状态：总线颜色',
		'returns': '总线颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.getState_LineType',
		'description': '获取属性状态：线型',
		'returns': '线型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.setState_BusName',
		'description': '设置属性状态：总线名称',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'busName', 'description': '总线名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.setState_Line',
		'description': '设置属性状态：多段线坐标组',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'line', 'description': '多段线坐标组' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.setState_Color',
		'description': '设置属性状态：总线颜色',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'color', 'description': '总线颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.setState_LineType',
		'description': '设置属性状态：线型',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'lineType', 'description': '线型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '总线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.toSync',
		'description': '将图元转换为同步图元',
		'returns': '总线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveBus.done',
		'description': '将对图元的更改应用到画布',
		'returns': '总线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCbbSymbolComponent.getState_Cbb',
		'description': '获取属性状态：关联复用模块',
		'returns': '关联复用模块',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCbbSymbolComponent.getState_CbbSymbol',
		'description': '获取属性状态：关联复用模块符号',
		'returns': '关联复用模块符号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_CenterX',
		'description': '获取属性状态：圆心 X',
		'returns': '圆心 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_CenterY',
		'description': '获取属性状态：圆心 Y',
		'returns': '圆心 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_Radius',
		'description': '获取属性状态：半径',
		'returns': '半径',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_Color',
		'description': '获取属性状态：颜色',
		'returns': '颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_FillColor',
		'description': '获取属性状态：填充颜色',
		'returns': '填充颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_LineType',
		'description': '获取属性状态：线型',
		'returns': '线型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.getState_FillStyle',
		'description': '获取属性状态：填充样式',
		'returns': '填充样式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_CenterX',
		'description': '设置属性状态：圆心 X',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'centerX', 'description': '圆心 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_CenterY',
		'description': '设置属性状态：圆心 Y',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'centerY', 'description': '圆心 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_Radius',
		'description': '设置属性状态：半径',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'radius', 'description': '半径' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_Color',
		'description': '设置属性状态：颜色',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'color', 'description': '颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_FillColor',
		'description': '设置属性状态：填充颜色',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'fillColor', 'description': '填充颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_LineType',
		'description': '设置属性状态：线型',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'lineType', 'description': '线型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.setState_FillStyle',
		'description': '设置属性状态：填充样式',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'fillStyle', 'description': '填充样式' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '圆图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.toSync',
		'description': '将图元转换为同步图元',
		'returns': '圆图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '圆图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveCircle.done',
		'description': '将对图元的更改应用到画布',
		'returns': '圆图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_ComponentType',
		'description': '获取属性状态：器件类型',
		'returns': '器件类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Component',
		'description': '获取属性状态：关联库器件',
		'returns': '关联库器件',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_SubPartName',
		'description': '获取属性状态：子图块名称',
		'returns': '子图块名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Mirror',
		'description': '获取属性状态：是否镜像',
		'returns': '是否镜像',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_AddIntoBom',
		'description': '获取属性状态：是否加入 BOM',
		'returns': '是否加入 BOM',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_AddIntoPcb',
		'description': '获取属性状态：是否转到 PCB',
		'returns': '是否转到 PCB',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Symbol',
		'description': '获取属性状态：关联库符号',
		'returns': '关联库符号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Footprint',
		'description': '获取属性状态：关联库封装',
		'returns': '关联库封装',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Designator',
		'description': '获取属性状态：位号',
		'returns': '位号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Name',
		'description': '获取属性状态：名称',
		'returns': '名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_UniqueId',
		'description': '获取属性状态：唯一 ID',
		'returns': '唯一 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Manufacturer',
		'description': '获取属性状态：制造商',
		'returns': '制造商',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_ManufacturerId',
		'description': '获取属性状态：制造商编号',
		'returns': '制造商编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_Supplier',
		'description': '获取属性状态：供应商',
		'returns': '供应商',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_SupplierId',
		'description': '获取属性状态：供应商编号',
		'returns': '供应商编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.getState_OtherProperty',
		'description': '获取属性状态：其它参数',
		'returns': '其它参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '器���图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Mirror',
		'description': '设置属性状态：是否镜像',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_AddIntoBom',
		'description': '设置属性状态：是否加入 BOM',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_AddIntoPcb',
		'description': '设置属性状态：是否转到 PCB',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'addIntoPcb', 'description': '是否转到 PCB' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Designator',
		'description': '设置属性状态：位号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'designator', 'description': '位号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Name',
		'description': '设置属性状态：名称',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'name', 'description': '名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_UniqueId',
		'description': '设置属性状态：唯一 ID',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'uniqueId', 'description': '唯一 ID' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Manufacturer',
		'description': '设置属性状态：制造商',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'manufacturer', 'description': '制造商' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_ManufacturerId',
		'description': '设置属性状态：制造商编号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'manufacturerId', 'description': '制造商编号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_Supplier',
		'description': '设置属性状态：供应商',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'supplier', 'description': '供应商' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_SupplierId',
		'description': '设置属性状态：供应商编号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'supplierId', 'description': '供应商编号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.setState_OtherProperty',
		'description': '设置属性状态：其它参数',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'otherProperty', 'description': '其它参数' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.toSync',
		'description': '将图元转换为同步图元',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent.done',
		'description': '将对图元的更改应用到画布',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_ComponentType',
		'description': '获取属性状态：器件类型',
		'returns': '器件类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Component',
		'description': '获取属性状态：关联库器件',
		'returns': '关联库器件',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_SubPartName',
		'description': '获取属性状态：子图块名称',
		'returns': '子图块名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Mirror',
		'description': '获取属性状态：是否镜像',
		'returns': '是否镜像',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_AddIntoBom',
		'description': '获取属性状态：是否加入 BOM',
		'returns': '是否加入 BOM',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_AddIntoPcb',
		'description': '获取属性状态：是否转到 PCB',
		'returns': '是否转到 PCB',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Symbol',
		'description': '获取属性状态：关联库符号',
		'returns': '关联库符号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Footprint',
		'description': '获取属性状态：关联库封装',
		'returns': '关联库封装',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Designator',
		'description': '获取属性状态：位号',
		'returns': '位号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Name',
		'description': '获取属性状态：名称',
		'returns': '名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_UniqueId',
		'description': '获取属性状态：唯一 ID',
		'returns': '唯一 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Manufacturer',
		'description': '获取属性状态：制造商',
		'returns': '制造商',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_ManufacturerId',
		'description': '获取属性状态：制造商编号',
		'returns': '制造商编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_Supplier',
		'description': '获取属性状态：供应商',
		'returns': '供应商',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_SupplierId',
		'description': '获取属性状态：供应商编号',
		'returns': '供应商编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.getState_OtherProperty',
		'description': '获取属性状态：其它参数',
		'returns': '其它参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Mirror',
		'description': '设置属性状态：是否镜像',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_AddIntoBom',
		'description': '设置属性状态：是否加入 BOM',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_AddIntoPcb',
		'description': '设置属性状态：是否转到 PCB',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'addIntoPcb', 'description': '是否转到 PCB' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Designator',
		'description': '设置属性状态：位号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'designator', 'description': '位号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Name',
		'description': '设置属性状态：名称',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'name', 'description': '名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_UniqueId',
		'description': '设置属性状态：唯一 ID',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'uniqueId', 'description': '唯一 ID' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Manufacturer',
		'description': '设置属性状态：制造商',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'manufacturer', 'description': '制造商' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_ManufacturerId',
		'description': '设置属性状态：制造商编号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'manufacturerId', 'description': '制造商编号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_Supplier',
		'description': '设置属性状态：供应商',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'supplier', 'description': '供应商' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_SupplierId',
		'description': '设置属性状态：供应商编号',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'supplierId', 'description': '供应商编号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.setState_OtherProperty',
		'description': '设置属性状态：其它参数',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'otherProperty', 'description': '其它参数' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.toSync',
		'description': '将图元转换为同步图元',
		'returns': '圆弧线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveComponent_2.done',
		'description': '将对图元的更改应用到画布',
		'returns': '器件图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PinNumber',
		'description': '获取属性状态：引脚编号',
		'returns': '引脚编号',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PinName',
		'description': '获取属性状态：引脚名称',
		'returns': '引脚名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PinLength',
		'description': '获取属性状态：引脚长度',
		'returns': '引脚长度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PinColor',
		'description': '获取属性状态：引脚颜色',
		'returns': '引脚颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_PinShape',
		'description': '获取属性状态：引脚形状',
		'returns': '引脚形状',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_pinType',
		'description': '获取属性状态：引脚类型',
		'returns': '引脚类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.getState_OtherProperty',
		'description': '获取属性状态：其它参数',
		'returns': '其它参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_PinNumber',
		'description': '设置属性状态：引脚编号',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'pinNumber', 'description': '引脚编号' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_PinName',
		'description': '设置属性状态：引脚名称',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'pinName', 'description': '引脚名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_PinLength',
		'description': '设置属性状态：引脚长度',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'pinLength', 'description': '引脚长度' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_PinColor',
		'description': '设置属性状态：引脚颜色',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'pinColor', 'description': '引脚颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_PinShape',
		'description': '设置属性状态：引脚形状',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'pinShape', 'description': '引脚形状' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_PinType',
		'description': '设置属性状态：引脚类型',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'pinType', 'description': '引脚类型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.setState_OtherProperty',
		'description': '设置属性状态：其它参数',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'otherProperty', 'description': '其它参数' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '引脚图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.toSync',
		'description': '将图元转换为同步图元',
		'returns': '引脚图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '引脚图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePin.done',
		'description': '将对图元的更改应用到画布',
		'returns': '引脚图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_Line',
		'description': '获取属性状态：坐标组',
		'returns': '坐标组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_Color',
		'description': '获取属性状态：颜色',
		'returns': '颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_FillColor',
		'description': '获取属性状态：填充颜色',
		'returns': '填充颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.getState_LineType',
		'description': '获取属性状态：线型',
		'returns': '线型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.setState_Line',
		'description': '设置属性状态：坐标组',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'line', 'description': '坐标组' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.setState_Color',
		'description': '设置属性状态：颜色',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'color', 'description': '颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.setState_FillColor',
		'description': '设置属性状态：填充颜色',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'fillColor', 'description': '填充颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.setState_LineType',
		'description': '设置属性状态：线型',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'lineType', 'description': '线型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '多边形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.toSync',
		'description': '将图元转换为同步图元',
		'returns': '多边形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '多边形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitivePolygon.done',
		'description': '将对图元的更改应用到画布',
		'returns': '多边形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_TopLeftX',
		'description': '获取属性状态：左上点 X',
		'returns': '左上点 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_TopLeftY',
		'description': '获取属性状态：左上点 Y',
		'returns': '左上点 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_Width',
		'description': '获取属性状态：宽',
		'returns': '宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_Height',
		'description': '获取属性状态：高',
		'returns': '高',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_CornerRadius',
		'description': '获取属性状态：圆角半径',
		'returns': '圆角半径',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_Color',
		'description': '获取属性状态：边框颜色',
		'returns': '边框颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_FillColor',
		'description': '获取属性状态：填充颜色',
		'returns': '填充颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_LineType',
		'description': '获取属性状态：线型',
		'returns': '线型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.getState_FillStyle',
		'description': '获取属性状态：填充样式',
		'returns': '填充样式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_TopLeftX',
		'description': '设置属性状态：左上点 X',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'topLeftX', 'description': '左上点 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_TopLeftY',
		'description': '设置属性状态：左上点 Y',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'topLeftY', 'description': '左上点 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_Width',
		'description': '设置属性状态：宽',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'width', 'description': '宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_Height',
		'description': '设置属性状态：高',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'height', 'description': '高' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_CornerRadius',
		'description': '设置属性状态：圆角半径',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'cornerRadius', 'description': '圆角半径' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_Color',
		'description': '设置属性状态：边框颜色',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'color', 'description': '边框颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_FillColor',
		'description': '设置属性状态：填充颜色',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'fillColor', 'description': '填充颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_LineType',
		'description': '设置属性状态：线型',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'lineType', 'description': '线型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.setState_FillStyle',
		'description': '设置属性状态：填充样式',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'fillStyle', 'description': '填充样式' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '矩形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.toSync',
		'description': '将图元转换为同步图元',
		'returns': '矩形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '矩形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveRectangle.done',
		'description': '将对图元的更改应用到画布',
		'returns': '矩形图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_X',
		'description': '获取属性状态：坐标 X',
		'returns': '坐标 X',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_Y',
		'description': '获取属性状态：坐标 Y',
		'returns': '坐标 Y',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_Content',
		'description': '获取属性状态：文本内容',
		'returns': '文本内容',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_Rotation',
		'description': '获取属性状态：旋转角度',
		'returns': '旋转角度',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_TextColor',
		'description': '获取属性状态：文本颜色',
		'returns': '文本颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_FontName',
		'description': '获取属性状态：字体名称',
		'returns': '字体名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_FontSize',
		'description': '获取属性状态：字体大小',
		'returns': '字体大小',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_Bold',
		'description': '获取属性状态：是否加粗',
		'returns': '是否加粗',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_Italic',
		'description': '获取属性状态：是否斜体',
		'returns': '是否斜体',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_UnderLine',
		'description': '获取属性状态：是否加下划线',
		'returns': '是否加下划线',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.getState_AlignMode',
		'description': '获取属性状态：对齐模式',
		'returns': '对齐模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_X',
		'description': '设置属性状态：坐标 X',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_Y',
		'description': '设置属性状态：坐标 Y',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_Content',
		'description': '设置属性状态：文本内容',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'content', 'description': '文本内容' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_Rotation',
		'description': '设置属性状态：旋转角度',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'rotation', 'description': '旋转角度' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_TextColor',
		'description': '设置属性状态：文本颜色',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'textColor', 'description': '文本颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_FontName',
		'description': '设置属性状态：字体名称',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'fontName', 'description': '字体名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_FontSize',
		'description': '设置属性状态：字体大小',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'fontSize', 'description': '字体大小' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_Bold',
		'description': '设置属性状态：是否加粗',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'bold', 'description': '是否加粗' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_Italic',
		'description': '设置属性状态：是否斜体',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'italic', 'description': '是否斜体' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_UnderLine',
		'description': '设置属性状态：是否加下划线',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'underLine', 'description': '是否加下划线' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.setState_AlignMode',
		'description': '设置属性状态：对齐模式',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'alignMode', 'description': '对齐模式' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '文本图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.toSync',
		'description': '将图元转换为同步图元',
		'returns': '文本图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.reset',
		'description': '将异步图元重置为当前画布状态',
		'returns': '文本图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveText.done',
		'description': '将对图元的更改应用到画布',
		'returns': '文本图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_PrimitiveType',
		'description': '获取属性状态：图元类型',
		'returns': '图元类型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_PrimitiveId',
		'description': '获取属性状态：图元 ID',
		'returns': '图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_Line',
		'description': '获取属性状态：多段线坐标组',
		'returns': '多段线坐标组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_Net',
		'description': '获取属性状态：网络名称',
		'returns': '网络名称',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_Color',
		'description': '获取属性状态：总线颜色',
		'returns': '总线颜色',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_LineWidth',
		'description': '获取属性状态：线宽',
		'returns': '线宽',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.getState_LineType',
		'description': '获取属性状态：线型',
		'returns': '线型',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.setState_Line',
		'description': '设置属性状态：多段线坐标组',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'line', 'description': '多段线坐标组' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.setState_Net',
		'description': '设置属性状态：网络名称',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.setState_Color',
		'description': '设置属性状态：导线颜色',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'color', 'description': '导线颜色' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.setState_LineWidth',
		'description': '设置属性状态：线宽',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'lineWidth', 'description': '线宽' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.setState_LineType',
		'description': '设置属性状态：线型',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'lineType', 'description': '线型' },
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.toAsync',
		'description': '将图元转换为异步图元',
		'returns': '导线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.toSync',
		'description': '将图元转换为同步图元',
		'returns': '导线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.isAsync',
		'description': '查询图元是否为异步图元',
		'returns': '是否为异步图元',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.isch_PrimitiveWire.done',
		'description': '将对图元的更改应用到画布',
		'returns': '导线图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.lib_3DModel.create',
		'description': '创建 3D 模型',
		'returns': '3D 模型 UUID',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'modelName', 'description': '3D 模型名称' },
			{ 'name': 'modelFile', 'description': '3D 模型文件数据' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_3DModel.delete',
		'description': '删除 3D 模型',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'modelUuid', 'description': '3D 模型 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_3DModel.modify',
		'description': '修改 3D 模型',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'modelUuid', 'description': '3D 模型 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'modelName', 'description': '3D 模型名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_3DModel.get',
		'description': '获取 3D 模型的所有属性',
		'returns': '3D 模型属性',
		'parameters': [
			{ 'name': 'modelUuid', 'description': '3D 模型 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_3DModel.copy',
		'description': '复制 3D 模型',
		'returns': '目标库内新 3D 模型的 UUID',
		'parameters': [
			{ 'name': 'modelUuid', 'description': '3D 模型 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'targetLibraryUuid', 'description': '目标库 UUID' },
			{ 'name': 'targetClassification', 'description': '目标库内的分类' },
			{ 'name': 'newModelName', 'description': '新 3D 模型名称，如若目标库内存在重名 3D 模型将导致复制失败' },
		],
	},
	{
		'methodPath': 'eda.lib_3DModel.search',
		'description': '搜索 3D 模型',
		'returns': '搜索到的 3D 模型属性列表',
		'parameters': [
			{ 'name': 'key', 'description': '搜索关键字' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'classification', 'description': '分类，默认为全部' },
			{ 'name': 'itemsOfPage', 'description': '一页搜索结果的数量' },
			{ 'name': 'page', 'description': '页数' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.create',
		'description': '创建复用模块',
		'returns': '复用模块 UUID',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'cbbName', 'description': '复用模块名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.delete',
		'description': '删除复用模块',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.modify',
		'description': '修改复用模块',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'cbbName', 'description': '复用模块名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.get',
		'description': '获取复用模块的所有属性',
		'returns': '复用模块属性',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.copy',
		'description': '复制复用模块',
		'returns': '目标库内新复用模块的 UUID',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'targetLibraryUuid', 'description': '目标库 UUID' },
			{ 'name': 'targetClassification', 'description': '目标库内的分类' },
			{ 'name': 'newCbbName', 'description': '新复用模块名称，如若目标库内存在重名复用模块将导致复制失败' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.search',
		'description': '搜索复用模块',
		'returns': '搜索到的复用模块属性列表',
		'parameters': [
			{ 'name': 'key', 'description': '搜索关键字' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'classification', 'description': '分类，默认为全部' },
			{ 'name': 'itemsOfPage', 'description': '一页搜索结果的数量' },
			{ 'name': 'page', 'description': '页数' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.openProjectInEditor',
		'description': '在编辑器打开复用模块工程',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Cbb.openSymbolInEditor',
		'description': '在编辑器打开复用模块符号',
		'returns': '标签页 ID，对应 {@link IDMT_EditorTabItem.tabId}，可使用 {@link DMT_EditorControl.getSplitScreenIdByTabId} 获取到分屏 ID',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'splitScreenId', 'description': '分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 {@link DMT_EditorControl} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.createPrimary',
		'description': '创建一级分类',
		'returns': '分类索引',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID' },
			{ 'name': 'libraryType', 'description': '库类型' },
			{ 'name': 'primaryClassificationName', 'description': '一级分类名称' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.createSecondary',
		'description': '创建二级分类',
		'returns': '分类索引',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID' },
			{ 'name': 'libraryType', 'description': '库类型' },
			{ 'name': 'primaryClassificationUuid', 'description': '一级分类 UUID' },
			{ 'name': 'secondaryClassificationName', 'description': '二级分类名称' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.getIndexByName',
		'description': '获取指定名称的分类的分类索引',
		'returns': '分类索引',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID' },
			{ 'name': 'libraryType', 'description': '库类型' },
			{ 'name': 'primaryClassificationName', 'description': '一级分类名称' },
			{ 'name': 'secondaryClassificationName', 'description': '二级分类名称' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.getNameByUuid',
		'description': '获取指定 UUID 的分类的名称',
		'returns': '两级分类的名称',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID' },
			{ 'name': 'libraryType', 'description': '库类型' },
			{ 'name': 'primaryClassificationUuid', 'description': '一级分类 UUID' },
			{ 'name': 'secondaryClassificationUuid', 'description': '二级分类 UUID，如若不指定，则只获取一级分类的信息' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.getNameByIndex',
		'description': '获取指定索引的分类的名称',
		'returns': '两级分类的名称',
		'parameters': [
			{ 'name': 'classificationIndex', 'description': '分类索引' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.getAllClassificationTree',
		'description': '获取所有分类信息组成的树',
		'returns': '分类信息组成的树结构数据',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID' },
			{ 'name': 'libraryType', 'description': '库类型' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.deleteByUuid',
		'description': '删除指定 UUID 的分类',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID' },
			{ 'name': 'libraryType', 'description': '库类型' },
			{ 'name': 'primaryClassificationUuid', 'description': '一级分类 UUID' },
			{ 'name': 'secondaryClassificationUuid', 'description': '二级分类 UUID' },
		],
	},
	{
		'methodPath': 'eda.lib_Classification.deleteByIndex',
		'description': '删除指定索引的分类',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'classificationIndex', 'description': '分类索引' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.create',
		'description': '创建器件',
		'returns': '器件 UUID',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'deviceName', 'description': '器件名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'association', 'description': '关联符号、封装、图像，指定 `symbolType` 则创建新符号，无需新建符号则无需指定 `symbolType`，但请注意，如若不新建符号也不指定符号的关联信息将无法创建器件' },
			{ 'name': 'description', 'description': '描述' },
			{ 'name': 'property', 'description': '其它参数，仅 `designator`、`addIntoBom`、`addIntoPcb` 存在默认值' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.delete',
		'description': '删除器件',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'deviceUuid', 'description': '器件 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.modify',
		'description': '修改器件',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'deviceUuid', 'description': '器件 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'deviceName', 'description': '器件名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'association', 'description': '关联符号、封装、图像' },
			{ 'name': 'description', 'description': '描述' },
			{ 'name': 'property', 'description': '其它参数' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.get',
		'description': '获取器件的所有属性',
		'returns': '器件属性',
		'parameters': [
			{ 'name': 'deviceUuid', 'description': '器件 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.copy',
		'description': '复制器件',
		'returns': '目标库内新器件的 UUID',
		'parameters': [
			{ 'name': 'deviceUuid', 'description': '器件 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'targetLibraryUuid', 'description': '目标库 UUID' },
			{ 'name': 'targetClassification', 'description': '目标库内的分类' },
			{ 'name': 'newDeviceName', 'description': '新器件名称，如若目标库内存在重名器件将导致复制失败' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.search',
		'description': '搜索器件',
		'returns': '搜索到的器件属性的列表',
		'parameters': [
			{ 'name': 'key', 'description': '搜索关键字' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'classification', 'description': '分类，默认为全部' },
			{ 'name': 'symbolType', 'description': '符号类型，默认为全部' },
			{ 'name': 'itemsOfPage', 'description': '一页搜索结果的数量' },
			{ 'name': 'page', 'description': '页数' },
		],
	},
	{
		'methodPath': 'eda.lib_Device.getByLcscIds',
		'description': '使用立创 C 编号批量获取器件',
		'returns': '搜索到的器件属性的列表',
		'parameters': [
			{ 'name': 'lcscIds', 'description': '立创 C 编号数组' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'allowMultiMatch', 'description': '是否允许单个立创 C 编号匹配多个结果' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.create',
		'description': '创建封装',
		'returns': '封装 UUID',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'footprintName', 'description': '封装名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.delete',
		'description': '删除封装',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.modify',
		'description': '修改封装',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'footprintName', 'description': '封装名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.updateDocumentSource',
		'description': '更新封装的文档源码',
		'returns': '是否更新成功',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'documentSource', 'description': '文档源码' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.get',
		'description': '获取封装的所有属性',
		'returns': '封装属性',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.copy',
		'description': '复制封装',
		'returns': '目标库内新封装的 UUID',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'targetLibraryUuid', 'description': '目标库 UUID' },
			{ 'name': 'targetClassification', 'description': '目标库内的分类' },
			{ 'name': 'newFootprintName', 'description': '新封装名称，如若目标库内存在重名封装将导致复制失败' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.search',
		'description': '搜索封装',
		'returns': '搜索到的封装属性列表',
		'parameters': [
			{ 'name': 'key', 'description': '搜索关键字' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'classification', 'description': '分类，默认为全部' },
			{ 'name': 'itemsOfPage', 'description': '一页搜索结果的数量' },
			{ 'name': 'page', 'description': '页数' },
		],
	},
	{
		'methodPath': 'eda.lib_Footprint.openInEditor',
		'description': '在编辑器打开文档',
		'returns': '标签页 ID，对应 {@link IDMT_EditorTabItem.tabId}，可使用 {@link DMT_EditorControl.getSplitScreenIdByTabId} 获取到分屏 ID',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'splitScreenId', 'description': '分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 {@link DMT_EditorControl} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_LibrariesList.getSystemLibraryUuid',
		'description': '获取系统库的 UUID',
		'returns': '系统库的 UUID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.lib_LibrariesList.getPersonalLibraryUuid',
		'description': '获取个人库的 UUID',
		'returns': '个人库的 UUID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.lib_LibrariesList.getProjectLibraryUuid',
		'description': '获取工程库的 UUID',
		'returns': '工程库的 UUID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.lib_LibrariesList.getFavoriteLibraryUuid',
		'description': '获取收藏库的 UUID',
		'returns': '收藏库的 UUID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.lib_LibrariesList.getAllLibrariesList',
		'description': '获取所有库的列表',
		'returns': '库信息列表',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.create',
		'description': '创建面板库',
		'returns': '面板库 UUID',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'panelLibraryName', 'description': '面板库名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.delete',
		'description': '删除面板库',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'panelLibraryUuid', 'description': '面板库 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.modify',
		'description': '修改面板库',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'panelLibraryUuid', 'description': '面板库 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'panelLibraryName', 'description': '面板库名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.get',
		'description': '获取面板库的所有属性',
		'returns': '面板库属性',
		'parameters': [
			{ 'name': 'panelLibraryUuid', 'description': '面板库 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.copy',
		'description': '复制面板库',
		'returns': '目标库内新面板库的 UUID',
		'parameters': [
			{ 'name': 'panelLibraryUuid', 'description': '面板库 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'targetLibraryUuid', 'description': '目标库 UUID' },
			{ 'name': 'targetClassification', 'description': '目标库内的分类' },
			{ 'name': 'newPanelLibraryName', 'description': '新面板库名称，如若目标库内存在重名面板库将导致复制失败' },
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.search',
		'description': '搜索面板库',
		'returns': '搜索到的面板库属性列表',
		'parameters': [
			{ 'name': 'key', 'description': '搜索关键字' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'classification', 'description': '分类，默认为全部' },
			{ 'name': 'itemsOfPage', 'description': '一页搜索结果的数量' },
			{ 'name': 'page', 'description': '页数' },
		],
	},
	{
		'methodPath': 'eda.lib_PanelLibrary.openInEditor',
		'description': '在编辑器打开文档',
		'returns': '标签页 ID，对应 {@link IDMT_EditorTabItem.tabId}，可使用 {@link DMT_EditorControl.getSplitScreenIdByTabId} 获取到分屏 ID',
		'parameters': [
			{ 'name': 'panelLibraryUuid', 'description': '面板库 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'splitScreenId', 'description': '分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 {@link DMT_EditorControl} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.create',
		'description': '创建符号',
		'returns': '符号 UUID',
		'parameters': [
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'symbolName', 'description': '符号名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'symbolType', 'description': '符号类型' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.delete',
		'description': '删除符号',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'symbolUuid', 'description': '符号 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.modify',
		'description': '修改符号',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'symbolUuid', 'description': '符号 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'symbolName', 'description': '符号名称' },
			{ 'name': 'classification', 'description': '分类' },
			{ 'name': 'description', 'description': '描述' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.updateDocumentSource',
		'description': '更新符号的文档源码',
		'returns': '是否更新成功',
		'parameters': [
			{ 'name': 'symbolUuid', 'description': '符号 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'documentSource', 'description': '文档源码' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.get',
		'description': '获取符号的所有属性',
		'returns': '符号属性',
		'parameters': [
			{ 'name': 'symbolUuid', 'description': '符号 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.copy',
		'description': '复制符号',
		'returns': '目标库内新符号的 UUID',
		'parameters': [
			{ 'name': 'symbolUuid', 'description': '符号 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'targetLibraryUuid', 'description': '目标库 UUID' },
			{ 'name': 'targetClassification', 'description': '目标库内的分类' },
			{ 'name': 'newSymbolName', 'description': '新符号名称，如若目标库内存在重名符号将导致复制失败' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.search',
		'description': '搜索符号',
		'returns': '搜索到的符号属性列表',
		'parameters': [
			{ 'name': 'key', 'description': '搜索关键字' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，默认为系统库，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'classification', 'description': '分类，默认为全部' },
			{ 'name': 'symbolType', 'description': '符号类型，默认为全部' },
			{ 'name': 'itemsOfPage', 'description': '一页搜索结果的数量' },
			{ 'name': 'page', 'description': '页数' },
		],
	},
	{
		'methodPath': 'eda.lib_Symbol.openInEditor',
		'description': '在编辑器打开文档',
		'returns': '标签页 ID，对应 {@link IDMT_EditorTabItem.tabId}，可使用 {@link DMT_EditorControl.getSplitScreenIdByTabId} 获取到分屏 ID',
		'parameters': [
			{ 'name': 'symbolUuid', 'description': '符号 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'splitScreenId', 'description': '分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 {@link DMT_EditorControl} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.importChanges',
		'description': '从原理图导入变更',
		'returns': '导入操作是否成功，导入失败或未传入原理图 UUID 的游离 PCB 将返回 `false`',
		'parameters': [
			{ 'name': 'uuid', 'description': '原理图 UUID，默认为关联在同一个 Board 下的原理图' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.importAutoRouteJsonFile',
		'description': '导入自动布线文件（JSON）',
		'returns': '导入操作是否成功',
		'parameters': [
			{ 'name': 'autoRouteFile', 'description': '欲导入的 JSON 文件' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.importAutoLayoutJsonFile',
		'description': '导入自动布局文件（JSON）',
		'returns': '导入操作是否成功',
		'parameters': [
			{ 'name': 'autoLayoutFile', 'description': '欲导入的 JSON 文件' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.save',
		'description': '保存文档',
		'returns': '保存操作是否成功，保存失败、上传失败等错误均返回 `false`',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Document.getCalculatingRatlineStatus',
		'description': '获取当前飞线计算功能状态',
		'returns': '功能状态',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Document.startCalculatingRatline',
		'description': '启动飞线计算功能',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Document.stopCalculatingRatline',
		'description': '停止飞线计算功能',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Document.convertCanvasOriginToDataOrigin',
		'description': '输入画布坐标返回该坐标对应的数据坐标',
		'returns': '数据原点坐标',
		'parameters': [
			{ 'name': 'canvasOriginX', 'description': '画布原点 X' },
			{ 'name': 'canvasOriginY', 'description': '画布原点 Y' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.convertDataOriginToCanvasOrigin',
		'description': '输入数据坐标返回该坐标对应的画布坐标',
		'returns': '画布原点坐标',
		'parameters': [
			{ 'name': 'x', 'description': '数据原点 X' },
			{ 'name': 'y', 'description': '数据原点 Y' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.getCanvasOrigin',
		'description': '获取画布原点相对于数据原点的偏移坐标',
		'returns': '画布原点相对于数据原点的偏移坐标',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Document.setCanvasOrigin',
		'description': '设置画布原点相对于数据原点的偏移坐标',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'offsetX', 'description': '画布原点相对于数据原点的 X 坐标偏移' },
			{ 'name': 'offsetY', 'description': '画布原点相对于数据原点的 Y 坐标偏移' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.navigateToCoordinates',
		'description': '定位到画布坐标',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.navigateToRegion',
		'description': '定位到画布区域',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'left', 'description': '矩形框第一 X 坐标' },
			{ 'name': 'right', 'description': '矩形框第二 X 坐标' },
			{ 'name': 'top', 'description': '矩形框第一 Y 坐标' },
			{ 'name': 'bottom', 'description': '矩形框第二 Y 坐标' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.getPrimitiveAtPoint',
		'description': '获取坐标点的图元',
		'returns': '坐标点的图元，如若坐标点无法找到图元，将返回 `undefined`',
		'parameters': [
			{ 'name': 'x', 'description': '坐标点 X' },
			{ 'name': 'y', 'description': '坐标点 Y' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.getPrimitivesInRegion',
		'description': '获取区域内所有图元',
		'returns': '区域内所有图元',
		'parameters': [
			{ 'name': 'left', 'description': '矩形框第一 X 坐标' },
			{ 'name': 'right', 'description': '矩形框第二 X 坐标' },
			{ 'name': 'top', 'description': '矩形框第一 Y 坐标' },
			{ 'name': 'bottom', 'description': '矩形框第二 Y 坐标' },
			{ 'name': 'leftToRight', 'description': '是否仅获取完全框选的图元，`false` 则触碰即获取' },
		],
	},
	{
		'methodPath': 'eda.pcb_Document.zoomToBoardOutline',
		'description': '缩放到板框（适应板框）',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.check',
		'description': '检查 DRC',
		'returns': 'DRC 检查是否通过',
		'parameters': [
			{ 'name': 'strict', 'description': '是否严格检查，当前 PCB 统一为严格检查模式' },
			{ 'name': 'userInterface', 'description': '是否显示 UI（呼出底部 DRC 窗口）' },
			{ 'name': 'includeVerboseError', 'description': '是否在返回值中包含详细错误信息，如若为 `true`，则返回值将始终为数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.check',
		'description': '检查 DRC',
		'returns': 'DRC 检查的详细结果',
		'parameters': [
			{ 'name': 'strict', 'description': '是否严格检查，当前 PCB 统一为严格检查模式' },
			{ 'name': 'userInterface', 'description': '是否显示 UI（呼出底部 DRC 窗口）' },
			{ 'name': 'includeVerboseError', 'description': '是否在返回值中包含详细错误信息，如若为 `true`，则返回值将始终为数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getCurrentRuleConfigurationName',
		'description': '获取当前设计规则配置名称',
		'returns': '当前设计规则配置名称，`undefined` 为获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getCurrentRuleConfiguration',
		'description': '获取当前设计规则配置',
		'returns': '当前设计规则配置，`undefined` 为获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getRuleConfiguration',
		'description': '获取指定设计规则配置',
		'returns': '设计规则配置，`undefined` 为不存在该设计规则',
		'parameters': [
			{ 'name': 'configurationName', 'description': '配置名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getAllRuleConfigurations',
		'description': '获取所有设计规则配置',
		'returns': '所有设计规则配置',
		'parameters': [
			{ 'name': 'includeSystem', 'description': '是否获取系统设计规则配置' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.saveRuleConfiguration',
		'description': '保存设计规则配置',
		'returns': '保存是否成功',
		'parameters': [
			{ 'name': 'ruleConfiguration', 'description': '设计规则配置' },
			{ 'name': 'configurationName', 'description': '配置名称' },
			{ 'name': 'allowOverwrite', 'description': '是否允许覆写同名设计规则配置，`false` 则将在遇到同名设计规则配置时返回 `false`，请注意可能的数据丢失风险' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.renameRuleConfiguration',
		'description': '重命名设计规则配置',
		'returns': '重命名是否成功',
		'parameters': [
			{ 'name': 'originalConfigurationName', 'description': '原设计规则配置名称' },
			{ 'name': 'configurationName', 'description': '新设计规则配置名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.deleteRuleConfiguration',
		'description': '删除设计规则配置',
		'returns': '删除是否成功',
		'parameters': [
			{ 'name': 'configurationName', 'description': '配置名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getDefaultRuleConfigurationName',
		'description': '获取新建 PCB 默认设计规则配置的名称',
		'returns': '默认设计规则配置的名称，`undefined` 为获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.setAsDefaultRuleConfiguration',
		'description': '设置为新建 PCB 默认设计规则配置',
		'returns': '设置是否成功',
		'parameters': [
			{ 'name': 'configurationName', 'description': '配置名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getNetRules',
		'description': '获取网络规则',
		'returns': '当前 PCB 的所有网络规则',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.overwriteNetRules',
		'description': '覆写网络规则',
		'returns': '覆写是否成功',
		'parameters': [
			{ 'name': 'netRules', 'description': '网络规则' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getNetByNetRules',
		'description': '获取网络-网络规则',
		'returns': '当前 PCB 的所有网络-网络规则',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.overwriteNetByNetRules',
		'description': '覆写网络-网络规则',
		'returns': '覆写是否成功',
		'parameters': [
			{ 'name': 'netByNetRules', 'description': '网络-网络规则' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getRegionRules',
		'description': '获取区域规则',
		'returns': '- 当前 PCB 的所有区域规则',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.overwriteRegionRules',
		'description': '覆写区域规则',
		'returns': '覆写是否成功',
		'parameters': [
			{ 'name': 'regionRules', 'description': '区域规则' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.createNetClass',
		'description': '创建网络类',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'netClassName', 'description': '网络类名称' },
			{ 'name': 'nets', 'description': '网络名称数组' },
			{ 'name': 'color', 'description': '网络类颜色' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.deleteNetClass',
		'description': '删除网络类',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'netClassName', 'description': '网络类名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.modifyNetClassName',
		'description': '修改网络类的名称',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'originalNetClassName', 'description': '原网络类名称' },
			{ 'name': 'netClassName', 'description': '新网络类名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.addNetToNetClass',
		'description': '将网络添加到网络类',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'netClassName', 'description': '网络类名称' },
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.removeNetFromNetClass',
		'description': '从网络类中移除网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'netClassName', 'description': '网络类名称' },
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getAllNetClasses',
		'description': '获取所有网络类的详细属性',
		'returns': '所有网络类的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.createDifferentialPair',
		'description': '创建差分对',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'differentialPairName', 'description': '差分对名称' },
			{ 'name': 'positiveNet', 'description': '正网络名称' },
			{ 'name': 'negativeNet', 'description': '负网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.deleteDifferentialPair',
		'description': '删除差分对',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'differentialPairName', 'description': '差分对名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.modifyDifferentialPairName',
		'description': '修改差分对的名称',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'originalDifferentialPairName', 'description': '原差分对名称' },
			{ 'name': 'differentialPairName', 'description': '新差分对名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.modifyDifferentialPairPositiveNet',
		'description': '修改差分对正网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'differentialPairName', 'description': '差分对名称' },
			{ 'name': 'positiveNet', 'description': '正网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.modifyDifferentialPairNegativeNet',
		'description': '修改差分对负网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'differentialPairName', 'description': '差分对名称' },
			{ 'name': 'negativeNet', 'description': '负网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getAllDifferentialPairs',
		'description': '获取所有差分对的详细属性',
		'returns': '所有差分对的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.createEqualLengthNetGroup',
		'description': '创建等长网络组',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'equalLengthNetGroupName', 'description': '等长网络组名称' },
			{ 'name': 'nets', 'description': '网络名称数组' },
			{ 'name': 'color', 'description': '等长网络组颜色' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.deleteEqualLengthNetGroup',
		'description': '删除等长网络组',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'equalLengthNetGroupName', 'description': '等长网络组名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.modifyEqualLengthNetGroupName',
		'description': '修改等长网络组的名称',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'originalEqualLengthNetGroupName', 'description': '原等长网络组名称' },
			{ 'name': 'equalLengthNetGroupName', 'description': '新等长网络组名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.addNetToEqualLengthNetGroup',
		'description': '将网络添加到等长网络组',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'equalLengthNetGroupName', 'description': '等长网络组名称' },
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.removeNetFromEqualLengthNetGroup',
		'description': '从等长网络组中移除网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'equalLengthNetGroupName', 'description': '等长网络组名称' },
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getAllEqualLengthNetGroups',
		'description': '获取所有等长网络组的详细属性',
		'returns': '所有等长网络组的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.createPadPairGroup',
		'description': '创建焊盘对组',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'padPairGroupName', 'description': '焊盘对组名称' },
			{ 'name': 'padPairs', 'description': '焊盘对数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.deletePadPairGroup',
		'description': '删除焊盘对组',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'padPairGroupName', 'description': '焊盘对组名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.modifyPadPairGroupName',
		'description': '修改焊盘对组的名称',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'originalPadPairGroupName', 'description': '原焊盘对组名称' },
			{ 'name': 'padPairGroupName', 'description': '新焊盘对组名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.addPadPairToPadPairGroup',
		'description': '将焊盘对添加到焊盘对组',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'padPairGroupName', 'description': '焊盘对组名称' },
			{ 'name': 'padPair', 'description': '焊盘对' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.removePadPairFromPadPairGroup',
		'description': '从焊盘对组中移除焊盘对',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'padPairGroupName', 'description': '焊盘对组名称' },
			{ 'name': 'padPair', 'description': '焊盘对' },
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getAllPadPairGroups',
		'description': '获取所有焊盘对组的详细属性',
		'returns': '所有焊盘对组的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Drc.getPadPairGroupMinWireLength',
		'description': '获取焊盘对组最短导线长度',
		'returns': '所有焊盘对的最短导线长度',
		'parameters': [
			{ 'name': 'padPairGroupName', 'description': '焊盘对组名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Event.addMouseEventListener',
		'description': '新增鼠标事件监听',
		'parameters': [
			{ 'name': 'id', 'description': '事件 ID，用以防止重复注册事件' },
			{ 'name': 'eventType', 'description': '事件类型' },
			{ 'name': 'callFn', 'description': '事件触发时的回调函数' },
			{ 'name': 'onlyOnce', 'description': '是否仅监听一次' },
		],
	},
	{
		'methodPath': 'eda.pcb_Event.removeEventListener',
		'description': '移除事件监听',
		'returns': '是否移除指定事件监听',
		'parameters': [
			{ 'name': 'id', 'description': '事件 ID' },
		],
	},
	{
		'methodPath': 'eda.pcb_Event.isEventListenerAlreadyExist',
		'description': '查询事件监听是否存在',
		'returns': '事件监听是否存在',
		'parameters': [
			{ 'name': 'id', 'description': '事件 ID' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.selectLayer',
		'description': '选中图层',
		'returns': '操作是否成功，不存在指定层将返回 `false`',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setLayerVisible',
		'description': '将层设置为可见',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'layer', 'description': '层，如若不指定任何层则默认为所有层' },
			{ 'name': 'setOtherLayerInvisible', 'description': '是否将其它层设置为不可见' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setLayerInvisible',
		'description': '将层设置为不可见',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'layer', 'description': '层，如若不指定任何层则默认为所有层' },
			{ 'name': 'setOtherLayerVisible', 'description': '是否将其它层设置为可见' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.lockLayer',
		'description': '锁定层',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'layer', 'description': '层，如若不指定任何层则默认为所有层' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.unlockLayer',
		'description': '取消锁定层',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'layer', 'description': '层，如若不指定任何层则默认为所有层' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setTheNumberOfCopperLayers',
		'description': '设置铜箔层数',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'numberOfLayers', 'description': '层数' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setLayerColorConfiguration',
		'description': '设置层颜色配置',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'colorConfiguration', 'description': '颜色配置' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setInactiveLayerTransparency',
		'description': '设置非激活层透明度',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'transparency', 'description': '透明度，范围 `0-100`' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setPcbType',
		'description': '设置 PCB 类型',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'pcbType', 'description': 'PCB 类型' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.addCustomLayer',
		'description': '新增自定义层',
		'returns': '新增的自定义层的图层 ID，如若为 `undefined` 则为新增失败，可能是自定义层数量已达到上限',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.removeLayer',
		'description': '移除层',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.modifyLayer',
		'description': '修改图层属性',
		'returns': '修改后的图层属性，如若为 `undefined` 则代表修改失败或图层不存在',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'property', 'description': '属性' },
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.getAllLayers',
		'description': '获取所有图层的详细属性',
		'returns': '所有图层的详细属性',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Layer.setInactiveLayerDisplayMode',
		'description': '设置非激活层展示模式',
		'returns': '是否设置成功',
		'parameters': [
			{ 'name': 'displayMode', 'description': '展示模式' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getGerberFile',
		'description': '获取 PCB 制版文件（Gerber）',
		'returns': 'PCB 制版文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'colorSilkscreen', 'description': '是否生成彩色丝印制造文件（嘉立创专用文件）' },
			{ 'name': 'unit', 'description': '单位' },
			{ 'name': 'digitalFormat', 'description': '数字格式' },
			{ 'name': 'other', 'description': '其它' },
			{ 'name': 'layers', 'description': '导出层，默认则按照嘉立创生产需求导出' },
			{ 'name': 'objects', 'description': '导出对象，默认则按照嘉立创生产需求导出' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.get3DFile',
		'description': '获取 3D 模型文件',
		'returns': '3D 模型文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'fileType', 'description': '文件类型' },
			{ 'name': 'element', 'description': '导出对象' },
			{ 'name': 'modelMode', 'description': '导出模式，`Outfit` = 装配体，`Parts` = 零件' },
			{ 'name': 'autoGenerateModels', 'description': '是否为未绑定 3D 模型的元件自动生成 3D 模型（根据元件的“高度”属性）' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.get3DShellFile',
		'description': '获取 3D 外壳文件',
		'returns': '3D 外壳文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'fileType', 'description': '文件类型' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getPickAndPlaceFile',
		'description': '获取坐标文件（PickAndPlace）',
		'returns': '坐标文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'fileType', 'description': '文件类型' },
			{ 'name': 'unit', 'description': '单位' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getFlyingProbeTestFile',
		'description': '获取飞针测试文件',
		'returns': '飞针测试文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getBomTemplates',
		'description': '获取 BOM 模板列表',
		'returns': 'BOM 模板列表',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.uploadBomTemplateFile',
		'description': '上传 BOM 模板文件',
		'returns': 'BOM 模板名称',
		'parameters': [
			{ 'name': 'templateFile', 'description': 'BOM 模板文件' },
			{ 'name': 'template', 'description': 'BOM 模板名称，如若为 `undefined` 则自动从 `templateFile` 中取值' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getBomTemplateFile',
		'description': '获取 BOM 模板文件',
		'returns': 'BOM 模板文件',
		'parameters': [
			{ 'name': 'template', 'description': 'BOM 模板名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.deleteBomTemplate',
		'description': '删除 BOM 模板',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'template', 'description': 'BOM 模板名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getBomFile',
		'description': '获取 BOM 文件',
		'returns': 'BOM 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'fileType', 'description': '文件类型' },
			{ 'name': 'template', 'description': '模板名称' },
			{ 'name': 'filterOptions', 'description': '过滤规则，仅应包含需要启用的规则，`property` 为规则名称，`includeValue` 为匹配的值' },
			{ 'name': 'statistics', 'description': '统计，包含所有需要启用的统计项的名称' },
			{ 'name': 'property', 'description': '属性，包含所有需要启用的属性的名称' },
			{ 'name': 'columns', 'description': '列的属性及排序，`title`、`sort`、`group`、`orderWeight` 不传入则取默认值，`null` 代表 **无** 或 **空**' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getTestPointFile',
		'description': '获取测试点报告文件',
		'returns': '测试点报告文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'fileType', 'description': '文件类型' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getNetlistFile',
		'description': '获取网表文件（Netlist）',
		'returns': '网表文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'netlistType', 'description': '网表类型' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getDxfFile',
		'description': '获取 DXF 文件',
		'returns': 'DXF 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'layers', 'description': '导出层' },
			{ 'name': 'objects', 'description': '导出对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getPdfFile',
		'description': '获取 PDF 文件',
		'returns': 'PDF 文件数据（或压缩包）',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'outputMethod', 'description': '输出方式' },
			{ 'name': 'contentConfig', 'description': '内容配置' },
			{ 'name': 'watermark', 'description': '水印' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getIpcD356AFile',
		'description': '获取 IPC-D-356A 文件',
		'returns': 'IPC-D-356A 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getOpenDatabaseDoublePlusFile',
		'description': '获取 ODB++ 文件',
		'returns': 'ODB++ 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'unit', 'description': '单位' },
			{ 'name': 'otherData', 'description': '其它' },
			{ 'name': 'layers', 'description': '导出层，默认则按照嘉立创生产需求导出' },
			{ 'name': 'objects', 'description': '导出对象，默认则按照嘉立创生产需求导出' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getDsnFile',
		'description': '获取自动布线文件（DSN）',
		'returns': '自动布线 DSN 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getAutoRouteJsonFile',
		'description': '获取自动布线文件（JSON）',
		'returns': '自动布线 JSON 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getAutoLayoutJsonFile',
		'description': '获取自动布局文件（JSON）',
		'returns': '自动布局 JSON 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getAltiumDesignerFile',
		'description': '获取 Altium Designer 文件',
		'returns': 'Altium Designer 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getPadsFile',
		'description': '获取 PADS 文件',
		'returns': 'PADS 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.getPcbInfoFile',
		'description': '获取 PCB 信息文件',
		'returns': 'PCB 信息文件',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.placeComponentsOrder',
		'description': '元件下单',
		'returns': '是否通过下单检查',
		'parameters': [
			{ 'name': 'interactive', 'description': '是否启用交互式检查' },
			{ 'name': 'ignoreWarning', 'description': '在非交互式检查时忽略警告' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.placeSmtComponentsOrder',
		'description': 'SMT 元件下单',
		'returns': '是否通过下单检查',
		'parameters': [
			{ 'name': 'interactive', 'description': '是否启用交互式检查' },
			{ 'name': 'ignoreWarning', 'description': '在非交互式检查时忽略警告' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.placePcbOrder',
		'description': 'PCB 下单',
		'returns': '是否通过下单检查',
		'parameters': [
			{ 'name': 'interactive', 'description': '是否启用交互式检查' },
			{ 'name': 'ignoreWarning', 'description': '在非交互式检查时忽略警告' },
		],
	},
	{
		'methodPath': 'eda.pcb_ManufactureData.place3DShellOrder',
		'description': '3D 外壳下单',
		'returns': '是否通过下单检查',
		'parameters': [
			{ 'name': 'interactive', 'description': '是否启用交互式检查' },
			{ 'name': 'ignoreWarning', 'description': '在非交互式检查时忽略警告' },
		],
	},
	{
		'methodPath': 'eda.pcb_MathPolygon.createPolygon',
		'description': '创建单多边形',
		'returns': '单多边形对象，`undefined` 表示数据不合法',
		'parameters': [
			{ 'name': 'polygon', 'description': '单多边形数据' },
		],
	},
	{
		'methodPath': 'eda.pcb_MathPolygon.createComplexPolygon',
		'description': '创建复杂多边形',
		'returns': '复杂多边形对象，`undefined` 表示数据不合法',
		'parameters': [
			{ 'name': 'complexPolygon', 'description': '复杂多边形数据' },
		],
	},
	{
		'methodPath': 'eda.pcb_MathPolygon.splitPolygon',
		'description': '拆分单多边形',
		'returns': '单多边形数组',
		'parameters': [
			{ 'name': 'complexPolygons', 'description': '复杂多边形' },
		],
	},
	{
		'methodPath': 'eda.pcb_MathPolygon.convertImageToComplexPolygon',
		'description': '将图像转换为复杂多边形对象',
		'returns': '复杂多边形对象',
		'parameters': [
			{ 'name': 'imageBlob', 'description': '图像 Blob 文件，可以使用 {@link SYS_FileSystem.openReadFileDialog} 方法从文件系统读取文件' },
			{ 'name': 'imageWidth', 'description': '图像宽度' },
			{ 'name': 'imageHeight', 'description': '图像高度' },
			{ 'name': 'tolerance', 'description': '容差，取值范围 `0`-`1`' },
			{ 'name': 'simplification', 'description': '简化，取值范围 `0`-`1`' },
			{ 'name': 'smoothing', 'description': '平滑，取值范围 `0`-`1.33`' },
			{ 'name': 'despeckling', 'description': '去斑，取值范围 `0`-`5`' },
			{ 'name': 'whiteAsBackgroundColor', 'description': '是否白色作为背景色' },
			{ 'name': 'inversion', 'description': '是否反相' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.getAllNetsName',
		'description': '获取所有网络的网络名称',
		'returns': '网络名称数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Net.getAllNetName',
		'description': '获取所有网络的网络名称',
		'returns': '网络名称数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_Net.getNetLength',
		'description': '获取指定网络的长度',
		'returns': '网络长度，`undefined` 为不存在该网络，`0` 为网络无长度',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.getAllPrimitivesByNet',
		'description': '获取关联指定网络的所有图元',
		'returns': '图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveTypes', 'description': '图元类型数组，如若指定图元类型不存在网络属性，返回的数据将恒为空' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.selectNet',
		'description': '选中网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.highlightNet',
		'description': '高亮网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.unhighlightNet',
		'description': '取消高亮网络',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.getNetlist',
		'description': '获取网表',
		'returns': '网表数据',
		'parameters': [
			{ 'name': 'type', 'description': '网表格式' },
		],
	},
	{
		'methodPath': 'eda.pcb_Net.setNetlist',
		'description': '更新网表',
		'parameters': [
			{ 'name': 'type', 'description': '网表格式' },
			{ 'name': 'netlist', 'description': '网表数据' },
		],
	},
	{
		'methodPath': 'eda.pcb_Primitive.getPrimitivesBBox',
		'description': '获取图元的 BBox',
		'returns': '图元的 BBox，如若图元不存在或没有 BBox，将会返回 `undefined` 的结果',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图元 ID 数组或图元对象数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.create',
		'description': '创建圆弧线',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'startX', 'description': '起始位置 X' },
			{ 'name': 'startY', 'description': '起始位置 Y' },
			{ 'name': 'endX', 'description': '终止位置 X' },
			{ 'name': 'endY', 'description': '终止位置 Y' },
			{ 'name': 'arcAngle', 'description': '圆弧角度' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'interactiveMode', 'description': '交互模式' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.delete',
		'description': '删除圆弧线',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆弧线的图元 ID 或圆弧线图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.modify',
		'description': '修改圆弧线',
		'returns': '圆弧线图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.get',
		'description': '获取圆弧线',
		'returns': '圆弧线图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆弧线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.get',
		'description': '获取圆弧线',
		'returns': '圆弧线图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆弧线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.getAllPrimitiveId',
		'description': '获取所有圆弧线的图元 ID',
		'returns': '圆弧线的图元 ID 数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveArc.getAll',
		'description': '获取所有圆弧线',
		'returns': '圆弧线图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.create',
		'description': '创建器件',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.delete',
		'description': '删除器件',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID 或器件图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.modify',
		'description': '修改器件',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
			{ 'name': 'designator', 'description': '位号' },
			{ 'name': 'name', 'description': '名称，`null` 表示留空' },
			{ 'name': 'uniqueId', 'description': '唯一 ID，`null` 表示留空' },
			{ 'name': 'manufacturer', 'description': '制造商，`null` 表示留空' },
			{ 'name': 'manufacturerId', 'description': '制造商编号，`null` 表示留空' },
			{ 'name': 'supplier', 'description': '供应商，`null` 表示留空' },
			{ 'name': 'supplierId', 'description': '供应商编号，`null` 表示留空' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.get',
		'description': '获取器件',
		'returns': '器件图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.get',
		'description': '获取器件',
		'returns': '器件图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.getAllPrimitiveId',
		'description': '获取所有器件的图元 ID',
		'returns': '器件的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.getAll',
		'description': '获取所有器件',
		'returns': '器件图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId',
		'description': '获取器件关联的所有焊盘',
		'returns': '器件焊盘图元数组',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '器件图元 ID' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.create',
		'description': '创建尺寸标注',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'dimensionType', 'description': '尺寸标注类型' },
			{ 'name': 'coordinateSet', 'description': '尺寸标注坐标集' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'unit', 'description': '单位' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'precision', 'description': '精度，取值范围 `0`-`4`' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.delete',
		'description': '删除尺寸标注',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '尺寸标注的图元 ID 或尺寸标注图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.modify',
		'description': '修改尺寸标注',
		'returns': '尺寸标注图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.get',
		'description': '获取尺寸标注',
		'returns': '尺寸标注图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '尺寸标注的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.get',
		'description': '获取尺寸标注',
		'returns': '尺寸标注图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '尺寸标注的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.getAllPrimitiveId',
		'description': '获取所有尺寸标注的图元 ID',
		'returns': '尺寸标注的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveDimension.getAll',
		'description': '获取所有尺寸标注',
		'returns': '尺寸标注图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.create',
		'description': '创建填充',
		'returns': '填充图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'complexPolygon', 'description': '复杂多边形对象' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'fillMode', 'description': '填充模式' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.delete',
		'description': '删除填充',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '填充的图元 ID 或填充图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.modify',
		'description': '修改填充',
		'returns': '填充图元对象，`undefined` 表示修改失败',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.get',
		'description': '获取填充',
		'returns': '填充图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '填充的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.get',
		'description': '获取填充',
		'returns': '填充图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '填充的图元 ID，可��为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.getAllPrimitiveId',
		'description': '获取所有填充的图元 ID',
		'returns': '填充的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveFill.getAll',
		'description': '获取所有填充',
		'returns': '填充图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.create',
		'description': '创建图像',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'x', 'description': 'BBox 左上点坐标 X' },
			{ 'name': 'y', 'description': 'BBox 左上点坐标 Y' },
			{ 'name': 'complexPolygon', 'description': '图像源数据（复杂多边形），可以使用 {@link PCB_MathPolygon.convertImageToComplexPolygon} 方法将图像文件转换为复杂多边形数据' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'width', 'description': '宽' },
			{ 'name': 'height', 'description': '高' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'horizonMirror', 'description': '是否水平镜像' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.delete',
		'description': '删除图像',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图像的图元 ID 或图像图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.modify',
		'description': '修改图像',
		'returns': '图像图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.get',
		'description': '获取图像',
		'returns': '图像图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图像的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.get',
		'description': '获取图像',
		'returns': '图像图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图像的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.getAllPrimitiveId',
		'description': '获取所有图像的图元 ID',
		'returns': '图像的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveImage.getAll',
		'description': '获取所有图像',
		'returns': '图像图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.create',
		'description': '创建直线',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'startX', 'description': '起始位置 X' },
			{ 'name': 'startY', 'description': '起始位置 Y' },
			{ 'name': 'endX', 'description': '终止位置 X' },
			{ 'name': 'endY', 'description': '终止位置 Y' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.delete',
		'description': '删除直线',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '直线的图元 ID 或直线图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.modify',
		'description': '修改直线',
		'returns': '直线图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.get',
		'description': '获取直线',
		'returns': '直线图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '直线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.get',
		'description': '获取直线',
		'returns': '直线图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '直线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.getAllPrimitiveId',
		'description': '获取所有直线的图元 ID',
		'returns': '折线的图元 ID 数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveLine.getAll',
		'description': '获取所有直线',
		'returns': '直线图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.create',
		'description': '创建二进制内嵌对象',
		'returns': '- 二进制内嵌对象图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'topLeftX', 'description': '左上点 X' },
			{ 'name': 'topLeftY', 'description': '左上点 Y' },
			{ 'name': 'binaryData', 'description': '二进制数据' },
			{ 'name': 'width', 'description': '宽' },
			{ 'name': 'height', 'description': '高' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否水平镜像' },
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.delete',
		'description': '删除二进制内嵌对象',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '二进制内嵌对象的图元 ID 或二进制内嵌对象图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.modify',
		'description': '修改二进制内嵌对象',
		'returns': '二进制内嵌对象图元对象，`undefined` 表示修改失败',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.get',
		'description': '获取二进制内嵌对象',
		'returns': '二进制内嵌对象图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '二进制内嵌对象的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.get',
		'description': '获取二进制内嵌对象',
		'returns': '二进制内嵌对象图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '二进制内嵌对象的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.getAllPrimitiveId',
		'description': '获取所有二进制内嵌对象的图元 ID',
		'returns': '二进制内嵌对象的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveObject.getAll',
		'description': '获取所有二进制内嵌对象',
		'returns': '二进制内嵌对象图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.create',
		'description': '创建焊盘',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'padNumber', 'description': '焊盘编号' },
			{ 'name': 'x', 'description': '位置 X' },
			{ 'name': 'y', 'description': '位置 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'pad', 'description': '焊盘外形' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'hole', 'description': '孔，`null` 标识无孔' },
			{ 'name': 'holeOffsetX', 'description': '孔偏移 X' },
			{ 'name': 'holeOffsetY', 'description': '孔偏移 Y' },
			{ 'name': 'holeRotation', 'description': '孔相对于焊盘的旋转角度' },
			{ 'name': 'metallization', 'description': '是否金属化孔壁' },
			{ 'name': 'padType', 'description': '焊盘类型' },
			{ 'name': 'specialPad', 'description': '特殊焊盘外形' },
			{ 'name': 'solderMaskAndPasteMaskExpansion', 'description': '阻焊/助焊扩展，`null` 表示遵循规则' },
			{ 'name': 'heatWelding', 'description': '热焊优化参数' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.delete',
		'description': '删除焊盘',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '焊盘的图元 ID 或焊盘图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.modify',
		'description': '修改焊盘',
		'returns': '焊盘图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.get',
		'description': '获取焊盘',
		'returns': '焊盘图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '焊盘的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.get',
		'description': '获取焊盘',
		'returns': '焊盘图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '焊盘的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.getAllPrimitiveId',
		'description': '获取所有焊盘的图元 ID',
		'returns': '焊盘的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePad.getAll',
		'description': '获取所有焊盘',
		'returns': '焊盘图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.create',
		'description': '创建折线',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'polygon', 'description': '单多边形对象' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.delete',
		'description': '删除折线',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '折线的图元 ID 或折线图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.modify',
		'description': '修改折线',
		'returns': '折线图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.get',
		'description': '获取折线',
		'returns': '折线图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '折线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.get',
		'description': '获取折线',
		'returns': '折线图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '折线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.getAllPrimitiveId',
		'description': '获取所有折线的图元 ID',
		'returns': '折线的图元 ID 数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePolyline.getAll',
		'description': '获取所有折线',
		'returns': '折线图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.create',
		'description': '创建覆铜边框',
		'returns': '覆铜边框图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'complexPolygon', 'description': '复杂多边形对象' },
			{ 'name': 'pourFillMethod', 'description': '覆铜填充方法' },
			{ 'name': 'preserveSilos', 'description': '是否保留孤岛' },
			{ 'name': 'pourName', 'description': '覆铜名称' },
			{ 'name': 'pourPriority', 'description': '覆铜优先级' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.delete',
		'description': '删除覆铜边框',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '覆铜边框的图元 ID 或覆铜边框图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.modify',
		'description': '修改覆铜边框',
		'returns': '覆铜边框图元对象，`undefined` 表示修改失败',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.get',
		'description': '获取覆铜边框',
		'returns': '覆铜边框图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '覆铜边框的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.get',
		'description': '获取覆铜边框',
		'returns': '覆铜边框图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '覆铜边框的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.getAllPrimitiveId',
		'description': '获取所有覆铜边框的图元 ID',
		'returns': '覆铜边框的图元 ID 数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitivePour.getAll',
		'description': '获取所有覆铜边框图元',
		'returns': '覆铜边框图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.create',
		'description': '创建区域',
		'returns': '区域图元对象',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'complexPolygon', 'description': '复杂多边形对象' },
			{ 'name': 'ruleType', 'description': '区域规则类型' },
			{ 'name': 'regionName', 'description': '区域名称' },
			{ 'name': 'lineWidth', 'description': '线宽' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.delete',
		'description': '删除区域',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '区域的图元 ID 或区域图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.modify',
		'description': '修改区域',
		'returns': '区域图元对象，`undefined` 表示修改失败',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.get',
		'description': '获取区域',
		'returns': '区域图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '区域的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.get',
		'description': '获取区域',
		'returns': '区域图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '区域的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.getAllPrimitiveId',
		'description': '获取所有区域的图元 ID',
		'returns': '区域的图元 ID 数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'ruleType', 'description': '区域规则类型，只会匹配所有规则类型均一致的图元' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveRegion.getAll',
		'description': '获取所有区域',
		'returns': '区域图元对象数组',
		'parameters': [
			{ 'name': 'layer', 'description': '层' },
			{ 'name': 'ruleType', 'description': '区域规则类型，只会匹配所有规则类型均一致的图元' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.create',
		'description': '创建过孔',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'holeDiameter', 'description': '孔径' },
			{ 'name': 'diameter', 'description': '外径' },
			{ 'name': 'viaType', 'description': '过孔类型' },
			{ 'name': 'designRuleBlindViaName', 'description': '盲埋孔设计规则项名称，定义过孔的开始层与结束层，`null` 表示非盲埋孔' },
			{ 'name': 'solderMaskExpansion', 'description': '阻焊/助焊扩展，`null` 表示跟随规则' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.delete',
		'description': '删除过孔',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '过孔的图元 ID 或过孔图元对象' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.modify',
		'description': '修改过孔',
		'returns': '过孔图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.get',
		'description': '获取过孔',
		'returns': '过孔图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '过孔的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.get',
		'description': '获取过孔',
		'returns': '过孔图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '过孔的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.getAllPrimitiveId',
		'description': '获取所有过孔图元 ID',
		'returns': '过孔的图元 ID 数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_PrimitiveVia.getAll',
		'description': '获取所有过孔',
		'returns': '过孔图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'primitiveLock', 'description': '是否锁定' },
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId',
		'description': '查询所有已选中图元的图元 ID',
		'returns': '所有已选中图元的图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.getAllSelectedPrimitives',
		'description': '查询所有已选中图元的图元对象',
		'returns': '所有已选中图元的图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.getSelectedPrimitives',
		'description': '查询选中图元的所有参数',
		'returns': '选中图元的所有参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.doSelectPrimitives',
		'description': '使用图元 ID 选中图元',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图元 ID' },
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.doCrossProbeSelect',
		'description': '进行交叉选择',
		'parameters': [
			{ 'name': 'components', 'description': '器件位号' },
			{ 'name': 'pins', 'description': '器件位号_引脚编号，格式为 [\'U1_1\', \'U1_2\']' },
			{ 'name': 'nets', 'description': '网络名称' },
			{ 'name': 'highlight', 'description': '是否高亮' },
			{ 'name': 'select', 'description': '操作是否成功' },
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.clearSelected',
		'description': '清除选中',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pcb_SelectControl.getCurrentMousePosition',
		'description': '获取当前鼠标在画布上的位置',
		'returns': '鼠标在画布上的位置，`undefined` 代表当前鼠标不���画布上',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.pnl_Document.save',
		'description': '保存文档',
		'returns': '保存操作是否成功，保存失败、上传失败等错误均返回 `false`',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_Document.importChanges',
		'description': '从 PCB 导入变更',
		'returns': '导入操作是否成功，导入失败或游离原理图返回 `false`',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_Document.save',
		'description': '保存文档',
		'returns': '保存操作是否成功，保存失败、上传失败等错误均返回 `false`',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_Drc.check',
		'description': '检查 DRC',
		'returns': 'DRC 检查是否无错误',
		'parameters': [
			{ 'name': 'strict', 'description': '是否严格检查，严格检查时存在 Warning 将返回 `false`，否则返回 `true`' },
			{ 'name': 'userInterface', 'description': '是否显示 UI（呼出底部 DRC 窗口）' },
		],
	},
	{
		'methodPath': 'eda.sch_Event.addMouseEventListener',
		'description': '新增鼠标事件监听',
		'parameters': [
			{ 'name': 'id', 'description': '事件 ID，用以防止重复注册事件' },
			{ 'name': 'eventType', 'description': '事件类型' },
			{ 'name': 'callFn', 'description': '事件触发时的回调函数' },
			{ 'name': 'onlyOnce', 'description': '是否仅监听一次' },
		],
	},
	{
		'methodPath': 'eda.sch_Event.removeEventListener',
		'description': '移除事件监听',
		'returns': '是否移除指定事件监听',
		'parameters': [
			{ 'name': 'id', 'description': '事件 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_Event.isEventListenerAlreadyExist',
		'description': '查询事件监听是否存在',
		'returns': '事件监听是否存在',
		'parameters': [
			{ 'name': 'id', 'description': '事件 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_ManufactureData.getBomFile',
		'description': '获取 BOM 文件',
		'returns': 'BOM 文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'fileType', 'description': '文件类型' },
			{ 'name': 'template', 'description': '模板名称' },
			{ 'name': 'filterOptions', 'description': '过滤规则，仅应包含需要启用的规则，`property` 为规则名称，`includeValue` 为匹配的值' },
			{ 'name': 'statistics', 'description': '统计，包含所有需要启用的统计项的名称' },
			{ 'name': 'property', 'description': '属性，包含所有需要启用的属性的名称' },
			{ 'name': 'columns', 'description': '列的属性及排序，`title`、`sort`、`group`、`orderWeight` 不传入则取默认值，`null` 代表 **无** 或 **空**' },
			{ 'name': 'assemblyVariantsConfig', 'description': '装配体变量配置' },
		],
	},
	{
		'methodPath': 'eda.sch_ManufactureData.getNetlistFile',
		'description': '获取网表文件（Netlist）',
		'returns': '网表文件数据',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'netlistType', 'description': '网表类型' },
		],
	},
	{
		'methodPath': 'eda.sch_ManufactureData.placeComponentsOrder',
		'description': '元件下单',
		'returns': '是否通过下单检查',
		'parameters': [
			{ 'name': 'interactive', 'description': '是否启用交互式检查' },
			{ 'name': 'ignoreWarning', 'description': '在非交互式检查时忽略警告' },
		],
	},
	{
		'methodPath': 'eda.sch_ManufactureData.placeSmtComponentsOrder',
		'description': 'SMT 元件下单',
		'returns': '是否通过下单检查',
		'parameters': [
			{ 'name': 'interactive', 'description': '是否启用交互式检查' },
			{ 'name': 'ignoreWarning', 'description': '在非交互式检查时忽略警告' },
		],
	},
	{
		'methodPath': 'eda.sch_Netlist.getNetlist',
		'description': '获取网表',
		'returns': '网表数据',
		'parameters': [
			{ 'name': 'type', 'description': '网表格式' },
		],
	},
	{
		'methodPath': 'eda.sch_Netlist.setNetlist',
		'description': '更新网表',
		'parameters': [
			{ 'name': 'type', 'description': '网表格式' },
			{ 'name': 'netlist', 'description': '网表数据' },
		],
	},
	{
		'methodPath': 'eda.sch_Primitive.getPrimitiveTypeByPrimitiveId',
		'description': '获取指定 ID 的图元的图元类型',
		'returns': '图元类型',
		'parameters': [
			{ 'name': 'id', 'description': '图元 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_Primitive.getPrimitiveByPrimitiveId',
		'description': '获取指定 ID 的图元的所有属性',
		'returns': '图元的所有属性',
		'parameters': [
			{ 'name': 'id', 'description': '图元 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_Primitive.getPrimitivesBBox',
		'description': '获取图元的 BBox',
		'returns': '图元的 BBox，如若图元不存在或没有 BBox，将会返回 `undefined` 的结果',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图元 ID 数组或图元对象数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.create',
		'description': '创建圆弧',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'startX', 'description': '起始点 X' },
			{ 'name': 'startY', 'description': '起始点 Y' },
			{ 'name': 'referenceX', 'description': '参考点 X' },
			{ 'name': 'referenceY', 'description': '参考点 Y' },
			{ 'name': 'endX', 'description': '终止点 X' },
			{ 'name': 'endY', 'description': '终止点 Y' },
			{ 'name': 'color', 'description': '颜色，`null` 表示默认' },
			{ 'name': 'fillColor', 'description': '填充颜色，`none` 表示无填充，`null` 表示默认' },
			{ 'name': 'lineWidth', 'description': '线宽，范围 `1-10`，`null` 表示默认' },
			{ 'name': 'lineType', 'description': '线型，`null` 表示默认' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.delete',
		'description': '删除圆弧',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆弧的图元 ID 或圆弧图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.modify',
		'description': '修改圆弧',
		'returns': '圆弧图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.get',
		'description': '获取圆弧',
		'returns': '圆弧图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆弧的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.get',
		'description': '获取圆弧',
		'returns': '圆弧图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆弧的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.getAllPrimitiveId',
		'description': '获取所有圆弧的图元 ID',
		'returns': '圆弧的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveArc.getAll',
		'description': '获取所有圆弧',
		'returns': '圆弧图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.create',
		'description': '创建总线',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'busName', 'description': '总线名称' },
			{ 'name': 'line', 'description': '多段线坐标组，每段都是连续的一组 `[x1, y1, x2, y2, x3, y3]` 所描述的线，如若多段线彼此无任何连接则创建将会失败' },
			{ 'name': 'color', 'description': '总线颜色，`null` 表示默认' },
			{ 'name': 'lineWidth', 'description': '线宽，范围 `1-10`，`null` 表示默认' },
			{ 'name': 'lineType', 'description': '线型，`null` 表示默认' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.delete',
		'description': '删除总线',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '总线的图元 ID 或总线图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.modify',
		'description': '修改总线',
		'returns': '总线图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '总线的图元 ID 或总线图元对象' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.get',
		'description': '获取总线',
		'returns': '总线图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '总线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.get',
		'description': '获取总线',
		'returns': '总线图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '总线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.getAllPrimitiveId',
		'description': '获取所有总线的图元 ID',
		'returns': '总线的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveBus.getAll',
		'description': '获取所有总线',
		'returns': '总线图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.create',
		'description': '创建圆',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'centerX', 'description': '圆心 X' },
			{ 'name': 'centerY', 'description': '圆心 Y' },
			{ 'name': 'radius', 'description': '半径' },
			{ 'name': 'color', 'description': '颜色，`null` 表示默认' },
			{ 'name': 'fillColor', 'description': '填充颜色，`none` 表示无填充，`null` 表示默认' },
			{ 'name': 'lineWidth', 'description': '线宽，范围 `1-10`，`null` 表示默认' },
			{ 'name': 'lineType', 'description': '线型，`null` 表示默认' },
			{ 'name': 'fillStyle', 'description': '填充样式，`null` 表示默认' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.delete',
		'description': '删除圆',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆的图元 ID 或圆图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.modify',
		'description': '修改圆',
		'returns': '圆图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.get',
		'description': '获取圆',
		'returns': '圆图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.get',
		'description': '获取圆',
		'returns': '圆图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '圆的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.getAllPrimitiveId',
		'description': '获取所有圆的图元 ID',
		'returns': '圆的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveCircle.getAll',
		'description': '获取所有圆',
		'returns': '圆图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetFlagComponentUuid_Power',
		'description': '设置在扩展 API 中 Power 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetFlagComponentUuid_Ground',
		'description': '设置在扩展 API 中 Ground 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetFlagComponentUuid_AnalogGround',
		'description': '设置在扩展 API 中 AnalogGround 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetFlagComponentUuid_ProtectGround',
		'description': '设置在扩展 API 中 ProtectGround 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetPortComponentUuid_IN',
		'description': '设置在扩展 API 中 IN 网络端口关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetPortComponentUuid_OUT',
		'description': '设置在扩展 API 中 OUT 网络端口关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.setNetPortComponentUuid_BI',
		'description': '设置在扩展 API 中 BI 网络端口关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.create',
		'description': '创建器件',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
			{ 'name': 'subPartName', 'description': '子图块名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
			{ 'name': 'addIntoPcb', 'description': '是否转到 PCB' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.createNetFlag',
		'description': '创建网络标识',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'identification', 'description': '标识类型' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.createNetPort',
		'description': '创建网络端口',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'direction', 'description': '端口方向' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.createShortCircuitFlag',
		'description': '创建短接标识',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.delete',
		'description': '删除器件',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID 或器件图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.modify',
		'description': '修改器件',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
			{ 'name': 'libraryPath', 'description': '库路径，默认为系统库' },
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
			{ 'name': 'addIntoPcb', 'description': '是否转到 PCB' },
			{ 'name': 'designator', 'description': '位号' },
			{ 'name': 'name', 'description': '名称，`null` 表示留空' },
			{ 'name': 'uniqueId', 'description': '唯一 ID，`null` 表示留空' },
			{ 'name': 'manufacturer', 'description': '制造商，`null` 表示留空' },
			{ 'name': 'manufacturerId', 'description': '制造商编号，`null` 表示留空' },
			{ 'name': 'supplier', 'description': '供应商，`null` 表示留空' },
			{ 'name': 'supplierId', 'description': '供应商编号，`null` 表示留空' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.get',
		'description': '获取器件',
		'returns': '器件图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.get',
		'description': '获取器件',
		'returns': '器件图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.getAllPrimitiveId',
		'description': '获取所有器件的图元 ID',
		'returns': '器件的图元 ID 数组',
		'parameters': [
			{ 'name': 'componentType', 'description': '器件类型' },
			{ 'name': 'allSchematicPages', 'description': '是否获取所有原理图图页的器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.getAll',
		'description': '获取所有器件',
		'returns': '器件图元对象数组',
		'parameters': [
			{ 'name': 'componentType', 'description': '器件类型' },
			{ 'name': 'allSchematicPages', 'description': '是否获取所有原理图图页的器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId',
		'description': '获取器件关联的所有引脚',
		'returns': '器件引脚图元数组',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '器件图元 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.placeComponentWithMouse',
		'description': '使用鼠标放置器件',
		'returns': '是否找到器件',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent.getAllPropertyNames',
		'description': '获取所有器件的所有属性名称集合',
		'returns': '所有器件的所有属性名称集合',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetFlagComponentUuid_Power',
		'description': '设置在扩展 API 中 Power 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetFlagComponentUuid_Ground',
		'description': '设置在扩展 API 中 Ground 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetFlagComponentUuid_AnalogGround',
		'description': '设置在扩展 API 中 AnalogGround 网络标��关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetFlagComponentUuid_ProtectGround',
		'description': '设置在扩展 API 中 ProtectGround 网络标识关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetPortComponentUuid_IN',
		'description': '设置在扩展 API 中 IN 网络端口关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetPortComponentUuid_OUT',
		'description': '设置在扩展 API 中 OUT 网络端口关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.setNetPortComponentUuid_BI',
		'description': '设置在扩展 API 中 BI 网络端口关联的器件 UUID',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.create',
		'description': '创建器件',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
			{ 'name': 'subPartName', 'description': '子图块名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
			{ 'name': 'addIntoPcb', 'description': '是否转到 PCB' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.createNetFlag',
		'description': '创建网络标识',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'identification', 'description': '标识类型' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.createNetPort',
		'description': '创建网络端口',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'direction', 'description': '端口方向' },
			{ 'name': 'net', 'description': '网络名称' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.createShortCircuitFlag',
		'description': '创建短接标识',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.delete',
		'description': '删除器件',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID 或器件图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.modify',
		'description': '修改器件',
		'returns': '器件图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'rotation', 'description': '旋转角度' },
			{ 'name': 'mirror', 'description': '是否镜像' },
			{ 'name': 'libraryPath', 'description': '库路径，默认为系统库' },
			{ 'name': 'addIntoBom', 'description': '是否加入 BOM' },
			{ 'name': 'addIntoPcb', 'description': '是否转到 PCB' },
			{ 'name': 'designator', 'description': '位号' },
			{ 'name': 'name', 'description': '名称，`null` 表示留空' },
			{ 'name': 'uniqueId', 'description': '唯一 ID，`null` 表示留空' },
			{ 'name': 'manufacturer', 'description': '制造商，`null` 表示留空' },
			{ 'name': 'manufacturerId', 'description': '制造商编号，`null` 表示留空' },
			{ 'name': 'supplier', 'description': '供应商，`null` 表示留空' },
			{ 'name': 'supplierId', 'description': '供应商编号，`null` 表示留空' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.get',
		'description': '获取器件',
		'returns': '器件图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.get',
		'description': '获取器件',
		'returns': '器件图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.getAllPrimitiveId',
		'description': '获取所有器件的图元 ID',
		'returns': '器件的图元 ID 数组',
		'parameters': [
			{ 'name': 'componentType', 'description': '器件类型' },
			{ 'name': 'allSchematicPages', 'description': '是否获取所有原理图图页的器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.getAll',
		'description': '获取所有器件',
		'returns': '器件图元对象数组',
		'parameters': [
			{ 'name': 'componentType', 'description': '器件类型' },
			{ 'name': 'allSchematicPages', 'description': '是否获取所有原理图图页的器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.getAllPinsByPrimitiveId',
		'description': '获取器件关联的所有引脚',
		'returns': '器件引脚图元数组',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '器件图元 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveComponent3.placeComponentWithMouse',
		'description': '使用鼠标放置器件',
		'returns': '是否找到器件',
		'parameters': [
			{ 'name': 'component', 'description': '关联库器件' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.create',
		'description': '创建引脚',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'pinNumber', 'description': '引脚编号' },
			{ 'name': 'pinName', 'description': '引脚名称' },
			{ 'name': 'rotation', 'description': '旋转角度，可选 `0` `90` `180` `270`' },
			{ 'name': 'pinLength', 'description': '引脚长度' },
			{ 'name': 'pinColor', 'description': '引脚颜色，`null` 表示默认' },
			{ 'name': 'pinShape', 'description': '引脚形状' },
			{ 'name': 'pinType', 'description': '引脚类型' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.delete',
		'description': '删除引脚',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '引脚的图元 ID 或引脚图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.modify',
		'description': '修改引脚',
		'returns': '引脚图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.get',
		'description': '获取引脚',
		'returns': '引脚图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '引脚的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.get',
		'description': '获取引脚',
		'returns': '引脚图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '引脚的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.getAllPrimitiveId',
		'description': '获取所有引脚的图元 ID',
		'returns': '引脚的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePin.getAll',
		'description': '获取所有引脚',
		'returns': '引脚图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.create',
		'description': '创建多边形',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'line', 'description': '坐标组，连续的一组 `[x1, y1, x2, y2, x3, y3]` 所描述的线' },
			{ 'name': 'color', 'description': '颜色，`null` 表示默认' },
			{ 'name': 'fillColor', 'description': '填充颜色，`none` 表示无填充，`null` 表示默认' },
			{ 'name': 'lineWidth', 'description': '线宽，范围 `1-10`，`null` 表示默认' },
			{ 'name': 'lineType', 'description': '线型，`null` 表示默认' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.delete',
		'description': '删除多边形',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '多边形的图元 ID 或多边形图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.modify',
		'description': '修改多边形',
		'returns': '多边形图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.get',
		'description': '获取多边形',
		'returns': '多边形图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '多边形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.get',
		'description': '获取多边形',
		'returns': '多边形图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '多边形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.getAllPrimitiveId',
		'description': '获取所有多边形的图元 ID',
		'returns': '多边形的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitivePolygon.getAll',
		'description': '获取所有多边形',
		'returns': '多边形图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.create',
		'description': '创建矩形',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'topLeftX', 'description': '左上点 X' },
			{ 'name': 'topLeftY', 'description': '左上点 Y' },
			{ 'name': 'width', 'description': '宽' },
			{ 'name': 'height', 'description': '高' },
			{ 'name': 'cornerRadius', 'description': '圆角半径' },
			{ 'name': 'rotation', 'description': '旋转角度，绕左上点旋转，可选 `0` `90` `180` `270`' },
			{ 'name': 'color', 'description': '颜色，`null` 表示默认' },
			{ 'name': 'fillColor', 'description': '填充颜色，`none` 表示无填充，`null` 表示默认' },
			{ 'name': 'lineWidth', 'description': '线宽，范围 `1-10`，`null` 表示默认' },
			{ 'name': 'lineType', 'description': '线型，`null` 表示默认' },
			{ 'name': 'fillStyle', 'description': '填充样式，`null` 表示默认' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.delete',
		'description': '删除矩形',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '矩形的图元 ID 或矩形图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.modify',
		'description': '修改矩形',
		'returns': '矩形图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.get',
		'description': '获取矩形',
		'returns': '矩形图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '矩形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.get',
		'description': '获取矩形',
		'returns': '矩形图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '矩形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.getAllPrimitiveId',
		'description': '获取所有矩形的图元 ID',
		'returns': '矩形的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveRectangle.getAll',
		'description': '获取所有矩形',
		'returns': '矩形图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.create',
		'description': '创建文本',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'x', 'description': '坐标 X' },
			{ 'name': 'y', 'description': '坐标 Y' },
			{ 'name': 'content', 'description': '文本内容' },
			{ 'name': 'rotation', 'description': '旋转角度，可选 `0` `90` `180` `270`' },
			{ 'name': 'textColor', 'description': '文本颜色，`null` 表示默认' },
			{ 'name': 'fontName', 'description': '字体名称，`null` 表示默认' },
			{ 'name': 'fontSize', 'description': '字体大小，`null` 表示默认' },
			{ 'name': 'bold', 'description': '是否加粗' },
			{ 'name': 'italic', 'description': '是否斜体' },
			{ 'name': 'underLine', 'description': '是否加下划线' },
			{ 'name': 'alignMode', 'description': '对齐模式，`0` 左顶，`1` 中顶，`2` 右顶，`3` 左中，`4` 中中，`5` 右中，`6` 左底，`7` 中底，`8` 右底' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.delete',
		'description': '删除文本',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '文本的图元 ID 或文本图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.modify',
		'description': '修改文本',
		'returns': '文本图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '图元 ID' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.get',
		'description': '获取文本',
		'returns': '文本图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '文本的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.get',
		'description': '获取文本',
		'returns': '文本图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '文本的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.getAllPrimitiveId',
		'description': '获取所有文本的图元 ID',
		'returns': '文本的图元 ID 数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveText.getAll',
		'description': '获取所有文本',
		'returns': '文本图元对象数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.create',
		'description': '创建导线',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'line', 'description': '多段线坐标组，每段都是连续的一组 `[x1, y1, x2, y2, x3, y3]` 所描述的线，如若多段线彼此无任何连接则创建将会失败' },
			{ 'name': 'net', 'description': '网络名称，如若未指定，则遵循：' },
			{ 'name': 'color', 'description': '导线颜色，`null` 表示默认' },
			{ 'name': 'lineWidth', 'description': '线宽，范围 `1-10`，`null` 表示默认' },
			{ 'name': 'lineType', 'description': '线型，`null` 表示默认' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.delete',
		'description': '删除导线',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '导线的图元 ID 或导线图元对象' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.modify',
		'description': '修改导线',
		'returns': '导线图元对象',
		'parameters': [
			{ 'name': 'primitiveId', 'description': '导线的图元 ID 或导线图元对象' },
			{ 'name': 'property', 'description': '修改参数' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.get',
		'description': '获取导线',
		'returns': '导线图元对象，`undefined` 表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '导线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.get',
		'description': '获取导线',
		'returns': '导线图元对象，空数组表示获取失败',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '导线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.getAllPrimitiveId',
		'description': '获取所有导线的图元 ID',
		'returns': '导线的图元 ID 数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.sch_PrimitiveWire.getAll',
		'description': '获取所有导线',
		'returns': '导线图元对象数组',
		'parameters': [
			{ 'name': 'net', 'description': '网络名称' },
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.getAllSelectedPrimitives_PrimitiveId',
		'description': '查询所有已选中图元的图元 ID',
		'returns': '所有已选中图元的图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.getAllSelectedPrimitives',
		'description': '查询所有已选中图元的图元对象',
		'returns': '所有已选中图元的图元对象',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId',
		'description': '查询选中图元的图元 ID',
		'returns': '选中图元的图元 ID',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.getSelectedPrimitives',
		'description': '查询选中图元的所有参数',
		'returns': '选中图元的所有参数',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.doSelectPrimitives',
		'description': '使用图元 ID 选中图元',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'primitiveIds', 'description': '图元 ID' },
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.doCrossProbeSelect',
		'description': '进行交叉选择',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'components', 'description': '器件位号' },
			{ 'name': 'pins', 'description': '器件位号_引脚编号，格式为 [\'U1_1\', \'U1_2\']' },
			{ 'name': 'nets', 'description': '网络名称' },
			{ 'name': 'highlight', 'description': '是否高亮' },
			{ 'name': 'select', 'description': '是否选中' },
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.clearSelected',
		'description': '清除选中',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sch_SelectControl.getCurrentMousePosition',
		'description': '获取当前鼠标在画布上的位置',
		'returns': '鼠标在画布上的位置，`undefined` 代表当前鼠标不在画布上',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_ClientUrl.request',
		'description': '发起即时请求',
		'returns': 'Fetch 的返回结果',
		'parameters': [
			{ 'name': 'url', 'description': '请求地址' },
			{ 'name': 'method', 'description': '请求方法' },
			{ 'name': 'data', 'description': '请求发送的数据，可以是直接数据或 {@link https://developer.mozilla.org/docs/Web/API/URLSearchParams | URLSearchParams} 对象，如果 method 为 `HEAD` 或 `GET`，本参数将被忽略' },
			{ 'name': 'options', 'description': '请求参数' },
			{ 'name': 'succeedCallFn', 'description': '请求成功后回调的函数' },
		],
	},
	{
		'methodPath': 'eda.sys_Dialog.showInformationMessage',
		'description': '弹出消息窗口',
		'parameters': [
			{ 'name': 'content', 'description': '消息文本，支持使用 `\n` 换行' },
			{ 'name': 'title', 'description': '弹出窗口标题' },
			{ 'name': 'buttonTitle', 'description': '按钮标题，为空则不显示按钮' },
		],
	},
	{
		'methodPath': 'eda.sys_Dialog.showConfirmationMessage',
		'description': '弹出确认窗口',
		'parameters': [
			{ 'name': 'content', 'description': '消息文本，支持使用 `\n` 换行' },
			{ 'name': 'title', 'description': '弹出窗口标题' },
			{ 'name': 'mainButtonTitle', 'description': '主要按钮标题' },
			{ 'name': 'buttonTitle', 'description': '主要按钮标题' },
			{ 'name': 'callbackFn', 'description': '回调函数' },
		],
	},
	{
		'methodPath': 'eda.sys_Dialog.showInputDialog',
		'description': '弹出输入窗口',
		'returns': '用户输入的值，始终为 `string` 类型，除非用户点击了 **取消** 按钮',
		'parameters': [
			{ 'name': 'beforeContent', 'description': '输入框上方文字' },
			{ 'name': 'afterContent', 'description': '输入框下方文字' },
			{ 'name': 'title', 'description': '弹出窗口标题' },
			{ 'name': 'type', 'description': '输入框类型' },
			{ 'name': 'value', 'description': '输入框默认值' },
			{ 'name': 'otherProperty', 'description': '其它参数，可参考 {@link https://developer.mozilla.org/docs/Web/HTML/Element/input#attributes | The HTML Input element}' },
			{ 'name': 'callbackFn', 'description': '回调函数' },
		],
	},
	{
		'methodPath': 'eda.sys_Dialog.showSelectDialog',
		'description': '弹出选择窗口',
		'returns': '用户选择的值，对应传入的 `options` 中的 `value` 字段',
		'parameters': [
			{ 'name': 'beforeContent', 'description': '选择框上方文字' },
			{ 'name': 'afterContent', 'description': '选择框下方文字' },
			{ 'name': 'title', 'description': '选择框标题' },
			{ 'name': 'defaultOption', 'description': '默认选项，以选项的值作为匹配参数，如若 `multiple` 参数为 `true`，则此处需要传入字符串数组' },
			{ 'name': 'multiple', 'description': '是否支持多选，默认为单选框' },
			{ 'name': 'callbackFn', 'description': '回调函数' },
		],
	},
	{
		'methodPath': 'eda.sys_Dialog.showSelectDialog',
		'description': '弹出多选窗口',
		'returns': '用户选择的值的集合数组，对应传入的 `options` 中的 `value` 字段',
		'parameters': [
			{ 'name': 'beforeContent', 'description': '多选框上方文字' },
			{ 'name': 'afterContent', 'description': '多选框下方文字' },
			{ 'name': 'title', 'description': '多选框标题' },
			{ 'name': 'defaultOption', 'description': '默认选项数组，以选项的值作为匹配参数' },
			{ 'name': 'multiple', 'description': '是否支持多选' },
			{ 'name': 'callbackFn', 'description': '回调函数' },
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isWeb',
		'description': '是否处于浏览器环境',
		'returns': '是否处于浏览器环境',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isClient',
		'description': '是否处于客户端环境',
		'returns': '是否处于客户端环境',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isEasyEDAProEdition',
		'description': '是否为 EasyEDA Pro 版本',
		'returns': '是否为 EasyEDA Pro 版本',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isJLCEDAProEdition',
		'description': '是否为 嘉立创EDA 专业版本',
		'returns': '是否为嘉立创EDA 专业版本',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isProPrivateEdition',
		'description': '是否为私有化部署版本',
		'returns': '是否为私有化部署版本',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isOnlineMode',
		'description': '是否为在线模式',
		'returns': '是否为在线模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isHalfOfflineMode',
		'description': '是否为半离线模式',
		'returns': '是否为半离线模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.isOfflineMode',
		'description': '是否为全离线模式',
		'returns': '是否为全离线模式',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.getEditorCurrentVersion',
		'description': '获取编辑器当前版本',
		'returns': '编辑器当前版本',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.getEditorCompliedDate',
		'description': '获取编辑器编译日期',
		'returns': '编辑器编译日期',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.getUserInfo',
		'description': '获取用户信息',
		'returns': '用户信息',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Environment.setKeepProjectHasOnlyOneBoard',
		'description': '设置环境：保持工程仅拥有一个板子',
		'parameters': [
			{ 'name': 'status', 'description': '环境变量状态' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getProjectFile',
		'description': '获取工程文件',
		'returns': '工程文件数据，`undefined` 表示当前未打开工程或数据获取失败',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'password', 'description': '加密密码' },
			{ 'name': 'fileType', 'description': '文件格式' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getDocumentFile',
		'description': '获取文档文件',
		'returns': '文档文件数据，`undefined` 表示当前未打开文档或数据获取失败',
		'parameters': [
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'password', 'description': '加密密码' },
			{ 'name': 'fileType', 'description': '文件格式' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getDocumentSource',
		'description': '获取文档源码',
		'returns': '文档源码数据，`undefined` 表示当前未打开文档或数据获取失败',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getDocumentFootprintSources',
		'description': '获取文档封装源码',
		'returns': '文档封装源码数据，数据获取失败将返回空数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.setDocumentSource',
		'description': '修改文档源码',
		'returns': '是否修改成功，如果输入的文档源码格式错误，将返回 `false` 的结果',
		'parameters': [
			{ 'name': 'source', 'description': '文档源码' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getProjectFileByProjectUuid',
		'description': '使用工程 UUID 获取工程文件',
		'returns': '工程文件数据，`undefined` 表示当前未打开工程或数据获取失败',
		'parameters': [
			{ 'name': 'projectUuid', 'description': '工程 UUID' },
			{ 'name': 'fileName', 'description': '文件名' },
			{ 'name': 'password', 'description': '加密密码' },
			{ 'name': 'fileType', 'description': '文件格式' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getDeviceFileByDeviceUuid',
		'description': '使用器件 UUID 获取器件文件',
		'returns': '器件文件数据，`undefined` 表示数据获取失败',
		'parameters': [
			{ 'name': 'deviceUuid', 'description': '器件 UUID 或器件 UUID 列表' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取，如若不传入，则为系统库' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getFootprintFileByFootprintUuid',
		'description': '使用封装 UUID 获取封装文件',
		'returns': '封装文件数据，`undefined` 表示数据获取失败',
		'parameters': [
			{ 'name': 'footprintUuid', 'description': '封装 UUID 或封装 UUID 列表' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getCbbFileByCbbUuid',
		'description': '使用复用模块 UUID 获取复用模块文件',
		'returns': '复用模块文件数据，`undefined` 表示数据获取失败',
		'parameters': [
			{ 'name': 'cbbUuid', 'description': '复用模块 UUID' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
			{ 'name': 'fileName', 'description': '复用模块名' },
			{ 'name': 'password', 'description': '加密密码' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.getPanelLibraryFileByPanelLibraryUuid',
		'description': '使用面板库 UUID 获取面板库文件',
		'returns': '面板库文件数据，`undefined` 表示数据获取失败',
		'parameters': [
			{ 'name': 'panelLibraryUuid', 'description': '面板库 UUID 或面板库 UUID 列表' },
			{ 'name': 'libraryUuid', 'description': '库 UUID，可以使用 {@link LIB_LibrariesList} 内的接口获取' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.importProjectByProjectFile',
		'description': '使用工程文件导入工程',
		'returns': '导入的工程的简略工程属性',
		'parameters': [
			{ 'name': 'projectFile', 'description': '工程文件' },
			{ 'name': 'fileType', 'description': '文件类型' },
			{ 'name': 'props', 'description': '导入参数，参考 EDA 前端 **导入** 窗口内的配置项' },
			{ 'name': 'saveTo', 'description': '保存到工程参数' },
		],
	},
	{
		'methodPath': 'eda.sys_FileManager.importProjectByProjectFile',
		'description': '使用工程文件导入工程',
		'returns': '导入的工程的简略工程属性',
		'parameters': [
			{ 'name': 'projectFile', 'description': '工程文件' },
			{ 'name': 'fileType', 'description': '文件类型' },
			{ 'name': 'props', 'description': '导入参数，参考 EDA 前端 **导入** 窗口内的配置项' },
			{ 'name': 'saveTo', 'description': '保存到工程参数' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.getExtensionFile',
		'description': '获取扩展内的文件',
		'returns': 'File 格式文件',
		'parameters': [
			{ 'name': 'uri', 'description': '文件路径' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.openReadFileDialog',
		'description': '打开读入文件窗口',
		'returns': 'File 格式文件数组',
		'parameters': [
			{ 'name': 'filenameExtensions', 'description': '文件扩展名' },
			{ 'name': 'multiFiles', 'description': '是否允许读取多文件' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.openReadFileDialog',
		'description': '打开读入文件窗口',
		'returns': 'File 格式文件',
		'parameters': [
			{ 'name': 'filenameExtensions', 'description': '文件扩展名' },
			{ 'name': 'multiFiles', 'description': '是否允许读取多文件' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.saveFile',
		'description': '保存文件',
		'parameters': [
			{ 'name': 'fileData', 'description': '文件数据' },
			{ 'name': 'fileName', 'description': '文件名称' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.readFileFromFileSystem',
		'description': '从文件系统读取文件',
		'returns': 'File 格式文件',
		'parameters': [
			{ 'name': 'uri', 'description': '文件资源定位符，需要包含完整的文件名称的绝对路径' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.saveFileToFileSystem',
		'description': '向文件系统写入文件',
		'returns': '写入操作是否成功，如若不允许覆盖但文件已存在将返回 `false` 的结果',
		'parameters': [
			{ 'name': 'uri', 'description': '文件资源定位符' },
			{ 'name': 'fileData', 'description': '文件数据' },
			{ 'name': 'fileName', 'description': '文件名称' },
			{ 'name': 'force', 'description': '强制写入（文件存在则覆盖文件）' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.listFilesOfFileSystem',
		'description': '查看文件系统路径下的文件列表',
		'returns': '当前目录下的文件列表',
		'parameters': [
			{ 'name': 'folderPath', 'description': '目录路径' },
			{ 'name': 'recursive', 'description': '是否递归获取所有子文件' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.deleteFileInFileSystem',
		'description': '删除文件系统内的文件',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'uri', 'description': '文件资源定位符' },
			{ 'name': 'force', 'description': '强制删除文件夹（当欲删除的是文件夹且文件夹内有文件时，是否强制删除该文件夹）' },
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.getEdaPath',
		'description': '获取 EDA 文档目录路径',
		'returns': 'EDA 文档目录路径',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.getDocumentsPath',
		'description': '获取文档目录路径',
		'returns': '文档目录路径',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.getLibrariesPaths',
		'description': '获取库目录路径',
		'returns': '库目录路径数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FileSystem.getProjectsPaths',
		'description': '获取工程目录路径',
		'returns': '工程目录路径数组',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FontManager.getFontsList',
		'description': '获取当前已经配置的字体列表',
		'returns': '字体列表',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_FontManager.addFont',
		'description': '添加字体到字体列表',
		'returns': '添加操作是否成功',
		'parameters': [
			{ 'name': 'fontName', 'description': '字体名称' },
		],
	},
	{
		'methodPath': 'eda.sys_FontManager.deleteFont',
		'description': '删除字体列表内的指定字体',
		'returns': '删除操作是否成功',
		'parameters': [
			{ 'name': 'fontName', 'description': '字体名称' },
		],
	},
	{
		'methodPath': 'eda.sys_HeaderMenu.insertHeaderMenus',
		'description': '导入顶部菜单数据',
		'parameters': [
			{ 'name': 'headerMenus', 'description': '顶部菜单数据' },
		],
	},
	{
		'methodPath': 'eda.sys_HeaderMenu.removeHeaderMenus',
		'description': '移除顶部菜单数据',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_HeaderMenu.replaceHeaderMenus',
		'description': '替换顶部菜单数据',
		'parameters': [
			{ 'name': 'headerMenus', 'description': '顶部菜单数据' },
		],
	},
	{
		'methodPath': 'eda.sys_I18n.text',
		'description': '输出语言文本',
		'returns': '语言文本',
		'parameters': [
			{ 'name': 'tag', 'description': '文本标签，对应多语言文件键值对中的键' },
			{ 'name': 'namespace', 'description': '文本命名空间，在扩展运行环境内默认为扩展的 UUID，否则为系统默认命名空间' },
			{ 'name': 'language', 'description': '语言，`undefined` 为 EDA 当前的显示语言' },
			{ 'name': 'args', 'description': '语言文本中替换占位符的参数' },
		],
	},
	{
		'methodPath': 'eda.sys_I18n.getCurrentLanguage',
		'description': '获取当前语言环境',
		'returns': '语言',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_I18n.getAllSupportedLanguages',
		'description': '查询所有支持的语言',
		'returns': '所有支持的语言列表',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_I18n.isLanguageSupported',
		'description': '检查语言是否受支持',
		'returns': '是否受支持',
		'parameters': [
			{ 'name': 'language', 'description': '语言' },
		],
	},
	{
		'methodPath': 'eda.sys_I18n.importMultilingual',
		'description': '导入多语言',
		'returns': '导入是否成功',
		'parameters': [
			{ 'name': 'language', 'description': '语言' },
			{ 'name': 'source', 'description': '欲导入的多语言数据对象' },
		],
	},
	{
		'methodPath': 'eda.sys_I18n.importMultilingualLanguage',
		'description': '导入多语言：指定命名空间和语言',
		'returns': '导入是否成功',
		'parameters': [
			{ 'name': 'namespace', 'description': '命名空间' },
			{ 'name': 'language', 'description': '语言' },
			{ 'name': 'source', 'description': '欲导入的多语言数据对象' },
		],
	},
	{
		'methodPath': 'eda.sys_I18n.importMultilingualNamespace',
		'description': '导入多语言：指定命名空间',
		'returns': '导入是否成功',
		'parameters': [
			{ 'name': 'namespace', 'description': '命名空间' },
			{ 'name': 'source', 'description': '欲导入的多语言数据对象' },
		],
	},
	{
		'methodPath': 'eda.sys_IFrame.openIFrame',
		'description': '打开内联框架窗口',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'htmlFileName', 'description': '需要加载的 HTML 文件在扩展包内的路径，从扩展根目录起始，例如 `/iframe/index.html`' },
			{ 'name': 'width', 'description': '内联框架窗口的宽度' },
			{ 'name': 'height', 'description': '内联框架窗口的高度' },
			{ 'name': 'id', 'description': '内联框架窗口 ID，用于关闭内联框架窗口' },
			{ 'name': 'props', 'description': '其它参数' },
		],
	},
	{
		'methodPath': 'eda.sys_IFrame.closeIFrame',
		'description': '关闭内联框架窗口',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'id', 'description': '内联框架窗口 ID，如若传入 `undefined`，将关闭由本扩展打开的所有内联框架窗口' },
		],
	},
	{
		'methodPath': 'eda.sys_IFrame.hideIFrame',
		'description': '隐藏内联框架窗口',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'id', 'description': '内联框架窗口 ID' },
		],
	},
	{
		'methodPath': 'eda.sys_IFrame.showIFrame',
		'description': '显示内联框架窗口',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'id', 'description': '内联框架窗口 ID' },
		],
	},
	{
		'methodPath': 'eda.sys_LoadingAndProgressBar.showProgressBar',
		'description': '显示进度条或设置进度条进度',
		'parameters': [
			{ 'name': 'progress', 'description': '进度值，取值范围 `0-100`' },
			{ 'name': 'title', 'description': '进度条标题' },
		],
	},
	{
		'methodPath': 'eda.sys_LoadingAndProgressBar.destroyProgressBar',
		'description': '销毁进度条',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_LoadingAndProgressBar.showLoading',
		'description': '显示无进度加载覆盖',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_LoadingAndProgressBar.destroyLoading',
		'description': '销毁无进度加载覆盖',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Log.add',
		'description': '添加日志条目',
		'parameters': [
			{ 'name': 'message', 'description': '日志内容' },
			{ 'name': 'type', 'description': '日志类型' },
		],
	},
	{
		'methodPath': 'eda.sys_Log.clear',
		'description': '清空日志',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Log.export',
		'description': '导出日志',
		'parameters': [
			{ 'name': 'types', 'description': '日志类型' },
		],
	},
	{
		'methodPath': 'eda.sys_Log.sort',
		'description': '筛选并获取日志条目',
		'returns': '符合筛选条件的日志条目数组',
		'parameters': [
			{ 'name': 'types', 'description': '日志类型数组，可以同时指定多种日志类型，如若不指定则为全部类型' },
		],
	},
	{
		'methodPath': 'eda.sys_Log.find',
		'description': '查找条目',
		'returns': '符合查找条件的日志条目数组',
		'parameters': [
			{ 'name': 'message', 'description': '查找内容' },
			{ 'name': 'types', 'description': '日志类型数组，可以在指定的日志类型内查找' },
		],
	},
	{
		'methodPath': 'eda.sys_Message.showToastMessage',
		'description': '显示吐司消息',
		'parameters': [
			{ 'name': 'message', 'description': '消息内容' },
			{ 'name': 'messageType', 'description': '消息类型' },
			{ 'name': 'timer', 'description': '自动关闭倒计时秒数，`0` 为不自动关闭' },
			{ 'name': 'bottomPanel', 'description': '展开底部信息面板' },
			{ 'name': 'buttonTitle', 'description': '回调按钮标题' },
			{ 'name': 'buttonCallbackFn', 'description': '回调函数内容，字符串形式，会被自动解析并执行' },
		],
	},
	{
		'methodPath': 'eda.sys_Message.showFollowMouseTip',
		'description': '展示跟随鼠标的提示',
		'parameters': [
			{ 'name': 'tip', 'description': '提示内容' },
			{ 'name': 'msTimeout', 'description': '展示时间，以毫秒（ms）为单位，如若不传入则持续展示，直到调用 {@link SYS_Message.removeFollowMouseTip | removeFollowMouseTip} 或被其它提示覆盖' },
		],
	},
	{
		'methodPath': 'eda.sys_Message.removeFollowMouseTip',
		'description': '移除跟随鼠标的提示',
		'parameters': [
			{ 'name': 'tip', 'description': '提示内容，如若传入，则仅当当前提示为指定内容时才移除' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBox.showInformationMessage',
		'description': '显示消息框',
		'parameters': [
			{ 'name': 'content', 'description': '消息文本，支持使用 `\n` 换行' },
			{ 'name': 'title', 'description': '消息框标题' },
			{ 'name': 'buttonTitle', 'description': '按钮标题，为空则不显示按钮' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBox.showConfirmationMessage',
		'description': '显示确认框',
		'parameters': [
			{ 'name': 'content', 'description': '消息文本，支持使用 `\n` 换行' },
			{ 'name': 'title', 'description': '确认框标题' },
			{ 'name': 'mainButtonTitle', 'description': '主要按钮标题' },
			{ 'name': 'buttonTitle', 'description': '主要按钮标题' },
			{ 'name': 'callbackFn', 'description': '回调函数，如需调用扩展内的函数，请在函数名前加上扩展的唯一 ID，以西文句号 `.` 分隔' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.createPrivateMessageBus',
		'description': '创建私有消息总线',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.removePrivateMessageBus',
		'description': '移除私有消息总线',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.push',
		'description': '私有消息总线：推消息',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'message', 'description': '消息' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.pushPublic',
		'description': '公共消息总线：推消息',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'message', 'description': '消息' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.pull',
		'description': '私有消息总线：拉消息',
		'returns': '消息总线任务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '拉到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.pullPublic',
		'description': '公共消息总线：拉消息',
		'returns': '消息总线任务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '拉到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.pullAsync',
		'description': '私有消息总线：拉消息 Promise 版本',
		'returns': '拉取到的消息',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.pullAsyncPublic',
		'description': '公共消息总线：拉消息 Promise 版本',
		'returns': '拉取到的消息',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.publish',
		'description': '私有消息总线：发布消息',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'message', 'description': '消息' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.publishPublic',
		'description': '公共消息总线：发布消息',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'message', 'description': '消息' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.subscribe',
		'description': '私有消息总线：订阅消息',
		'returns': '消息总线任务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '接收到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.subscribePublic',
		'description': '公共消息总线：订阅消息',
		'returns': '消息总线任务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '接收到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.subscribeOnce',
		'description': '私有消息总线：订阅单次消息',
		'returns': '消息总线任务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '接收到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.subscribeOncePublic',
		'description': '公共消息总线：订阅单次消息',
		'returns': '消息总线任务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '接收到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.rpcCall',
		'description': '私有消息总线：调用 RPC 服务',
		'returns': 'RPC 服务返回',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'message', 'description': '消息' },
			{ 'name': 'timeout', 'description': '超时' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.rpcCallPublic',
		'description': '公共消息总线：调用 RPC 服务',
		'returns': 'RPC 服务返回',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'message', 'description': '消息' },
			{ 'name': 'timeout', 'description': '超时' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.rpcService',
		'description': '私有消息总线：注册 RPC 服务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '接收到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_MessageBus.rpcServicePublic',
		'description': '公共消息总线：注册 RPC 服务',
		'parameters': [
			{ 'name': 'topic', 'description': '主题' },
			{ 'name': 'callbackFn', 'description': '接收到消息后的回调' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.openLeftPanel',
		'description': '打开左侧面板',
		'parameters': [
			{ 'name': 'tab', 'description': '标签页，如若不指定则不切换标签页' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.closeLeftPanel',
		'description': '关闭左侧面板',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.toggleLeftPanelLockState',
		'description': '切换左侧面板锁定状态',
		'parameters': [
			{ 'name': 'state', 'description': '是否锁定，如若不指定则反置当前状态' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.isLeftPanelLocked',
		'description': '查询左侧面板是否已锁定',
		'returns': '是否已锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.openRightPanel',
		'description': '打开右侧面板',
		'parameters': [
			{ 'name': 'tab', 'description': '标签页，如若不指定则不切换标签页' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.closeRightPanel',
		'description': '关闭右侧面板',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.toggleRightPanelLockState',
		'description': '切换右侧面板锁定状态',
		'parameters': [
			{ 'name': 'state', 'description': '是否锁定，如若不指定则反置当前状态' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.isRightPanelLocked',
		'description': '查询右侧面板是否已锁定',
		'returns': '是否已锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.openBottomPanel',
		'description': '打开底部面板',
		'parameters': [
			{ 'name': 'tab', 'description': '标签页，如若不指定则不切换标签页' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.closeBottomPanel',
		'description': '关闭底部面板',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.toggleBottomPanelLockState',
		'description': '切换底部面板锁定状态',
		'parameters': [
			{ 'name': 'state', 'description': '是否锁定，如若不指定则反置当前状态' },
		],
	},
	{
		'methodPath': 'eda.sys_PanelControl.isBottomPanelLocked',
		'description': '查询底部面板是否已锁定',
		'returns': '是否已锁定',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Setting.restoreDefault',
		'description': '全局恢复默认设置',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_ShortcutKey.registerShortcutKey',
		'description': '注册快捷键',
		'returns': '注册操作是否成功',
		'parameters': [
			{ 'name': 'shortcutKey', 'description': '快捷键，数组中包含多个元素则解析为组合快捷键，将按规则排序后存入缓存' },
			{ 'name': 'title', 'description': '快捷键标题，快捷键的友好名称' },
			{ 'name': 'callbackFn', 'description': '回调函数' },
		],
	},
	{
		'methodPath': 'eda.sys_ShortcutKey.unregisterShortcutKey',
		'description': '反注册快捷键',
		'returns': '反注册操作是否成功',
		'parameters': [
			{ 'name': 'shortcutKey', 'description': '快捷键，不区分传入的排列顺序，将自动排序并查询匹配的快捷键' },
		],
	},
	{
		'methodPath': 'eda.sys_ShortcutKey.getShortcutKeys',
		'description': '查询快捷键列表',
		'returns': '快捷键列表',
		'parameters': [
			{ 'name': 'includeSystem', 'description': '是否包含系统快捷键' },
		],
	},
	{
		'methodPath': 'eda.sys_Storage.getExtensionAllUserConfigs',
		'description': '获取扩展所有用户配置',
		'returns': '扩展所有用户配置信息',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Storage.setExtensionAllUserConfigs',
		'description': '设置扩展所有用户配置',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'configs', 'description': '扩展所有用户配置' },
		],
	},
	{
		'methodPath': 'eda.sys_Storage.clearExtensionAllUserConfigs',
		'description': '清除扩展所有用户配置',
		'returns': '操作是否成功',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Storage.getExtensionUserConfig',
		'description': '获取扩展用户配置',
		'returns': '配置项对应的值，不存在将返回 `undefined`',
		'parameters': [
			{ 'name': 'key', 'description': '配置项' },
		],
	},
	{
		'methodPath': 'eda.sys_Storage.setExtensionUserConfig',
		'description': '设置扩展用户配置',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'key', 'description': '配置项' },
			{ 'name': 'value', 'description': '值' },
		],
	},
	{
		'methodPath': 'eda.sys_Storage.deleteExtensionUserConfig',
		'description': '删除扩展用户配置',
		'returns': '操作是否成功',
		'parameters': [
			{ 'name': 'key', 'description': '配置项' },
		],
	},
	{
		'methodPath': 'eda.sys_Timer.setIntervalTimer',
		'description': '设置循环定时器',
		'returns': '定时器是否设置成功',
		'parameters': [
			{ 'name': 'id', 'description': '定时器 ID，用于定位&删除定时器' },
			{ 'name': 'timeout', 'description': '定时时间，单位 ms' },
			{ 'name': 'callFn', 'description': '定时调用函数' },
			{ 'name': 'args', 'description': '传给定时调用函数的参数' },
		],
	},
	{
		'methodPath': 'eda.sys_Timer.clearIntervalTimer',
		'description': '清除指定循环定时器',
		'returns': '定时器是否清除成功',
		'parameters': [
			{ 'name': 'id', 'description': '定时器 ID' },
		],
	},
	{
		'methodPath': 'eda.sys_Timer.setTimeoutTimer',
		'description': '设置单次定时器',
		'returns': '定时器是否设置成功',
		'parameters': [
			{ 'name': 'id', 'description': '定时器 ID' },
			{ 'name': 'timeout', 'description': '定时时间，单位 ms' },
			{ 'name': 'callFn', 'description': '定时调用函数' },
			{ 'name': 'args', 'description': '传给定时调用函数的参数' },
		],
	},
	{
		'methodPath': 'eda.sys_Timer.clearTimeoutTimer',
		'description': '清除指定单次定时器',
		'returns': '定时器是否清除成功',
		'parameters': [
			{ 'name': 'id', 'description': '定时器 ID' },
		],
	},
	{
		'methodPath': 'eda.sys_ToastMessage.showMessage',
		'description': '显示吐司消息',
		'parameters': [
			{ 'name': 'message', 'description': '消息内容' },
			{ 'name': 'messageType', 'description': '消息类型' },
			{ 'name': 'timer', 'description': '自动关闭倒计时秒数，`0` 为不自动关闭' },
			{ 'name': 'bottomPanel', 'description': '展开底部信息面板' },
			{ 'name': 'buttonTitle', 'description': '回调按钮标题' },
			{ 'name': 'buttonCallbackFn', 'description': '回调函数内容，字符串形式，会被自动解析并执行' },
		],
	},
	{
		'methodPath': 'eda.sys_Tool.netlistComparison',
		'description': '网表对比',
		'returns': '网表对比结果',
		'parameters': [
			{ 'name': 'netlist1', 'description': '网表 1，可以为当前工程内的 PCB 和原理图的 UUID、网表的文件数据' },
			{ 'name': 'netlist2', 'description': '网表 2，可以为当前工程内的 PCB 和原理图的 UUID、网表的文件数据' },
		],
	},
	{
		'methodPath': 'eda.sys_Unit.getSystemDataUnit',
		'description': '获取 API 系统数据单位跨度',
		'returns': '单位',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Unit.milToMm',
		'description': '单位转换：密尔到毫米',
		'returns': '输出毫米数',
		'parameters': [
			{ 'name': 'mil', 'description': '输入密尔数' },
			{ 'name': 'numberOfDecimals', 'description': '保留小数位数，默认为 `4`' },
		],
	},
	{
		'methodPath': 'eda.sys_Unit.milToInch',
		'description': '单位转换：密尔到英寸',
		'returns': '输出英寸数',
		'parameters': [
			{ 'name': 'mil', 'description': '输入密尔数' },
			{ 'name': 'numberOfDecimals', 'description': '保留小数位数，默认为 `4`' },
		],
	},
	{
		'methodPath': 'eda.sys_Unit.mmToMil',
		'description': '单位转换：毫米到密尔',
		'returns': '输出密尔数',
		'parameters': [
			{ 'name': 'mm', 'description': '输入毫米数' },
			{ 'name': 'numberOfDecimals', 'description': '保留小数位数，默认为 `4`' },
		],
	},
	{
		'methodPath': 'eda.sys_Unit.mmToInch',
		'description': '单位转换：毫米到英寸',
		'returns': '输出英寸数',
		'parameters': [
			{ 'name': 'mm', 'description': '输入毫米数' },
			{ 'name': 'numberOfDecimals', 'description': '保留小数位数，默认为 `4`' },
		],
	},
	{
		'methodPath': 'eda.sys_Unit.inchToMil',
		'description': '单位转换：英寸到密尔',
		'returns': '输出密尔数',
		'parameters': [
			{ 'name': 'inch', 'description': '输入英寸数' },
			{ 'name': 'numberOfDecimals', 'description': '保留小数位数，默认为 `4`' },
		],
	},
	{
		'methodPath': 'eda.sys_Unit.inchToMm',
		'description': '单位转换：英寸到毫米',
		'returns': '输出毫米数',
		'parameters': [
			{ 'name': 'inch', 'description': '输入英寸数' },
			{ 'name': 'numberOfDecimals', 'description': '保留小数位数，默认为 `4`' },
		],
	},
	{
		'methodPath': 'eda.sys_WebSocket.register',
		'description': '注册 WebSocket 连接',
		'parameters': [
			{ 'name': 'id', 'description': '自定义 WebSocket ID' },
			{ 'name': 'serviceUri', 'description': 'WebSocket 服务地址' },
			{ 'name': 'receiveMessageCallFn', 'description': '接收到消息时的回调函数' },
			{ 'name': 'connectedCallFn', 'description': '连接建立时的回调函数' },
			{ 'name': 'protocols', 'description': '子协议' },
		],
	},
	{
		'methodPath': 'eda.sys_WebSocket.send',
		'description': '向 WebSocket 服务器发送数据',
		'parameters': [
			{ 'name': 'id', 'description': '自定义的 WebSocket ID' },
			{ 'name': 'data', 'description': '发送的数据' },
			{ 'name': 'extensionUuid', 'description': '扩展 UUID，一般不需要指定，仅当需要操作其它扩展建立的 WebSocket 连接时才需要指定为其它扩展的 UUID' },
		],
	},
	{
		'methodPath': 'eda.sys_WebSocket.close',
		'description': '关闭 WebSocket 连接',
		'parameters': [
			{ 'name': 'id', 'description': '自定义的 WebSocket ID' },
			{ 'name': 'code', 'description': '数字状态码，对应 {@link https://developer.mozilla.org/docs/Web/API/CloseEvent/code | WebSocket.CloseEvent} 内允许的状态码' },
			{ 'name': 'reason', 'description': '一个人类可读的字符串，解释连接关闭的原因' },
			{ 'name': 'extensionUuid', 'description': '扩展 UUID，一般不需要指定，仅当需要操作其它扩展建立的 WebSocket 连接时才需要指定为其它扩展的 UUID' },
		],
	},
	{
		'methodPath': 'eda.sys_Window.open',
		'description': '打开资源窗口',
		'parameters': [
			{ 'name': 'url', 'description': '欲加载资源的 URL 或路径' },
			{ 'name': 'target', 'description': '上下文目标' },
		],
	},
	{
		'methodPath': 'eda.sys_Window.addEventListener',
		'description': '新增事件监听',
		'returns': '事件监听方法，用于移除事件监听，如若为 `undefined` 则表示创建事件监听失败',
		'parameters': [
			{ 'name': 'type', 'description': '事件类型，当前支持 `blur` `focus`' },
			{ 'name': 'listener', 'description': '事件监听回调' },
			{ 'name': 'options', 'description': '可选参数' },
		],
	},
	{
		'methodPath': 'eda.sys_Window.removeEventListener',
		'description': '移除事件监听',
		'parameters': [
			{ 'name': 'removableObject', 'description': '窗口事件监听可移除对象' },
		],
	},
	{
		'methodPath': 'eda.sys_Window.openUI',
		'description': '打开 UI 窗口',
		'parameters': [
			{ 'name': 'uiName', 'description': 'UI 名称' },
			{ 'name': 'args', 'description': '可选参数对象' },
		],
	},
	{
		'methodPath': 'eda.sys_Window.getCurrentTheme',
		'description': '获取当前主题',
		'returns': '当前主题',
		'parameters': [
		],
	},
	{
		'methodPath': 'eda.sys_Window.getUrlParam',
		'description': '获取 URL 参数',
		'returns': '参数值',
		'parameters': [
			{ 'name': 'key', 'description': '参数名' },
		],
	},
	{
		'methodPath': 'eda.sys_Window.getUrlAnchor',
		'description': '获取 URL 锚点',
		'returns': 'URL 锚点值',
		'parameters': [
		],
	},
];
