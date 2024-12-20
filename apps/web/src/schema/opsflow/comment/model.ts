import type { CommentType, MentionTargets } from '@/schema/opsflow/comment/type';

export interface CommentModel {
    comment_id: string;
    comment: string;
    comment_type: CommentType;
    created_by: string;
    is_edited: boolean;
    mentions: MentionTargets;
    task_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
