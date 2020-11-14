<template>
    <div>
        <p-tree-node :data="$t('PROJECT.LANDING.ALL_PROJECT')"
                     disable-toggle
                     @click-row="onClickTreeAll"
                     @init="onInitAllProjectNode"
        >
            <template #left-extra>
                <p-i name="ic_tree_all-projects" width="1rem" height="1rem"
                     class="all-project-button" color="inherit"
                />
            </template>
        </p-tree-node>

        <p-tree id-key="id"
                :fetcher="treeFetcher"
                :value-formatter="treeValueFormatter"
                :node-formatter="treeNodeFormatter"
                :data.sync="treeData"
                :toggle-on-select="false"
                :fetch-on-init="false"
                :select-releasable="false"
                @init="onTreeInit"
                @select="onSelectNode"
                @mouseenter-row="onHoverItem(...arguments, true)"
                @mouseleave-row="onHoverItem(...arguments, false)"
        >
            <template #toggle="{props, node}">
                <p-i v-if="node.loading" name="ic_working" :width="props.toggleSize"
                     :height="props.toggleSize"
                />
            </template>
            <template #toggle-right>
                <p-i name="ic_tree_project-group" class="project-group-icon"
                     width="1rem" height="1rem" color="inherit transparent"
                />
            </template>
            <template #right-extra="{props}">
                <div v-if="hoveredNode && props.data.id === hoveredNode.data.id">
                    <p-icon-button name="ic_plus" class="group-add-btn"
                                   width="1rem" height="1rem"
                                   @click.stop="$emit('create', hoveredNode)"
                    />
                </div>
            </template>
        </p-tree>
    </div>
</template>

<script lang="ts">

import PTreeNode from '@/components/molecules/tree-node-2/PTreeNode.vue';
import PI from '@/components/atoms/icons/PI.vue';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PTree from '@/components/organisms/tree/PTree.vue';
import {
    ValueFormatter, TreeNode, TreeNodeEventHandler, NodeFormatter,
} from '@/components/molecules/tree-node-2/type';
import { SpaceConnector } from '@/lib/space-connector';
import {Fetcher, TreeRootNode, TreeEventListeners} from '@/components/organisms/tree/type';
import { ProjectGroup, ProjectItem, ProjectNode } from '@/views/project/project/type';
import { find } from 'lodash';

interface Props {
    groupId?: string|null;
}

export default {
    name: 'ProjectGroupTree',
    components: {
        PTree, PIconButton, PI, PTreeNode,
    },
    props: {
        groupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            treeRef: null as null|any,
            treeData: [] as ProjectItem[],
            selectedNode: null as ProjectNode|null,
            childNodes: {},
            allProjectNode: null as null|TreeNode,
            hoveredNode: null as ProjectNode|null,
            rootNode: null as null|TreeRootNode<ProjectItem>,
        });

        const onInitAllProjectNode: TreeNodeEventHandler = (node) => {
            state.allProjectNode = node;
            if (props.groupId === null) node.setSelected(true);
        };

        const onTreeInit: TreeEventListeners['init'] = (tree) => {
            state.rootNode = tree;
        };

        const treeValueFormatter: ValueFormatter<ProjectItem> = node => node.data.name;

        const treeNodeFormatter: NodeFormatter<ProjectItem> = async (node) => {
            if (state.childNodes[node.nodeId]) {
                node.setChildren(state.childNodes[node.nodeId]);
                node.setExpanded(true);
            } else if (node.data.has_child) {
                node.setChildren([]);
            } else {
                node.setChildren(null);
            }

            if (props.groupId === node.nodeId) {
                node.setSelected(true);
                node.setExpanded(false);
            }
        };

        const onHoverItem: TreeNodeEventHandler<ProjectItem> = (node, e, isHovered: boolean) => {
            state.hoveredNode = isHovered ? node : null;
        };

        const onSelectNode: TreeEventListeners<ProjectItem>['select'] = (nodes, node, selected) => {
            if (selected) {
                state.selectedNode = node;
                if (state.allProjectNode) state.allProjectNode.setSelected(false);
                emit('select', node);
            }
        };

        const deleteSelectedNode = () => {
            if (state.selectedNode) {
                const parent = state.selectedNode.parent;
                if (parent) parent.deleteChild(state.selectedNode)
                state.selectedNode = parent;
                if (parent) parent.setSelected(true);
            }
        };

        const updateSelectedNode = (item: ProjectGroup) => {
            if (state.selectedNode) {
                state.selectedNode.setData({
                    ...state.selectedNode.data,
                    name: item.name,
                });
            }
        };

        const addNode = async (item: ProjectItem, parent: null|ProjectNode) => {
            // if (state.treeRef) state.treeRef.addNode(item, parent);
        };

        const listProjectGroups = async (id?: string) => {
            const params: any = {
                item_type: 'ROOT',
                exclude_type: 'PROJECT',
                sort: {
                    key: 'name',
                    desc: false,
                },
            };
            if (id) {
                params.item_type = 'PROJECT_GROUP';
                params.item_id = id;
            }

            try {
                const res = await SpaceConnector.client.identity.project.tree(params);
                return res.items as any[];
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const treeFetcher: Fetcher = async (node?: ProjectNode) => {
            const res = await listProjectGroups(node?.data.id);
            return res;
        };

        const getProjectGroupPath = async (groupId: string) => {
            const res = await SpaceConnector.client.identity.project.tree.search({
                item_type: 'PROJECT_GROUP',
                item_id: groupId,
            });
            return res.open_path;
        };

        const findNode = async (groupId: string) => {
            if (state.allProjectNode) state.allProjectNode.setSelected(false);

            state.childNodes = {};

            const paths = await getProjectGroupPath(groupId);
            const res: ProjectItem[][] = await Promise.all([listProjectGroups(), ...paths.map(p => listProjectGroups(p))]);
            res.forEach((arr, i) => {
                if (i === res.length - 1) return;
                const parent = find<ProjectItem[]>(arr, { id: paths[i] });
                if (parent) state.childNodes[paths[i]] = res[i + 1];
            });

            state.treeData = res[0];
            emit('load-finish');
        };

        const resetSelectedNodes = () => {
            // if (state.treeRef) state.treeRef.resetSelected();
        };

        const onClickTreeAll: TreeNodeEventHandler<ProjectItem> = (node) => {
            if (!state.allProjectNode) return;
            resetSelectedNodes();
            if (!state.allProjectNode.selected) {
                state.allProjectNode.setSelected(true);
                emit('select');
            }
        };

        const listNodes = async () => {
            if (state.allProjectNode) state.allProjectNode.setSelected(true);
            state.childNodes = {};
            state.treeData = await listProjectGroups();
            emit('load-finish');
        };

        listNodes();

        watch([() => state.rootNode, () => props.groupId], ([tree, id]) => {
            if (tree && id) {
            }
        })



        return {
            ...toRefs(state),
            listNodes,
            resetSelectedNodes,
            onHoverItem,
            onSelectNode,
            deleteSelectedNode,
            updateSelectedNode,
            addNode,
            findNode,
            treeFetcher,
            treeValueFormatter,
            treeNodeFormatter,
            onClickTreeAll,
            onInitAllProjectNode,
            onTreeInit,
        };
    },
};
</script>

<style lang="postcss" scoped>
::v-deep .basic {
    @apply mx-3 mt-1;
}
.all-project-button {
    @apply mr-1;
}
.project-group-icon {
    @apply mx-1;
}
.group-add-btn {
    @apply float-right mr-1;
    max-width: 1.5rem;
    max-height: 1.5rem;
    min-width: 1.5rem;
    min-height: 1.5rem;
    &:hover {
        @apply bg-blue-300 border-blue-300;
        color: inherit;
    }
}
</style>
