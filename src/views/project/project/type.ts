import { TimeStamp } from '@/models';
import {TreeNode} from "@/components/molecules/tree-node-2/type";

export interface ProjectGroupInfo {
    // eslint-disable-next-line camelcase
    project_group_id: string;
    name: string;
    // eslint-disable-next-line camelcase
    parent_project_group_info: null | ProjectGroupInfo;
    domain_id: string;
    // eslint-disable-next-line camelcase
    created_by: string;
    // eslint-disable-next-line camelcase
    created_at: TimeStamp;
    // eslint-disable-next-line camelcase
    deleted_at: TimeStamp;
    tags: object;
}

export interface ProjectModel {
    project_id: string;
    name: string;
    state: string;
    // eslint-disable-next-line camelcase
    project_group_info: ProjectGroupInfo;
    providers?: string[];
    // eslint-disable-next-line camelcase
    created_by: string;
    // eslint-disable-next-line camelcase
    created_at: TimeStamp;
    // eslint-disable-next-line camelcase
    deleted_at: TimeStamp;
    tags: object;
}

export interface ProjectItemResp {
    id: string;
    name: string;
    // eslint-disable-next-line camelcase
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export interface ProjectItem {
    id: string;
    item_type: 'ROOT'|'PROJECT_GROUP'|'PROJECT';
    name: string;
    has_child: boolean;
}

export type ProjectNode = TreeNode<ProjectItem>

export interface TreeSearchResp {
    open_path: string[];
}

export interface ProjectGroup {
    id: string;
    name: string;
}

export interface ProjectGroupSearchResult {
    projectGroup: ProjectGroup|null;
    value: string;
}
