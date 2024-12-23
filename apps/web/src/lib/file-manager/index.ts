import axios from 'axios';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ResourceGroupType } from '@/schema/_common/type';
import type { FileAddParameters } from '@/schema/file-manager/api-verbs/add';
import type {
    FileGetDownloadUrlParameters,
} from '@/schema/file-manager/api-verbs/get-download-url';
import type { FileModel } from '@/schema/file-manager/model';

import type { Attachment } from '@/common/components/editor/extensions/image/type';
import ErrorHandler from '@/common/composables/error/errorHandler';


type FileManagerResourceGroupType = Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'SYSTEM'>;

interface UploadedFile extends FileModel {
    upload_url: string;
    upload_options: object;
}
const getUploadInfo = async (file: File, resourceGroup: FileManagerResourceGroupType, domainOrWorkspaceId: string): Promise<UploadedFile> => {
    const params: FileAddParameters = {
        name: file.name,
        resource_group: resourceGroup,
    };
    if (resourceGroup === 'DOMAIN') params.domain_id = domainOrWorkspaceId;
    else if (resourceGroup === 'WORKSPACE') params.workspace_id = domainOrWorkspaceId;
    const result = await SpaceConnector.clientV2.fileManager.file.add<FileAddParameters, FileModel>(params);
    if (!result.upload_url || !result.upload_options) throw new Error('[File Manager] No upload info in response of add file api');
    return result as UploadedFile;
};

const uploadFile = async (uploadUrl: string, options: object, file: File) => {
    const formData = new FormData();
    Object.keys(options).forEach((key) => {
        formData.append(key, options[key]);
    });
    formData.append('file', file);
    await axios.post(uploadUrl, formData);
};

export const getUploadedFile = async (fileId: string): Promise<FileModel> => {
    const result = await SpaceConnector.clientV2.fileManager.file.getDownloadUrl<FileGetDownloadUrlParameters, FileModel>({
        file_id: fileId,
    });
    if (!result.download_url) throw new Error('[File Manager] No download url in response of update file state api');
    return result;
};
export const uploadFileAndGetFileInfo = async (file: File, resourceGroup: FileManagerResourceGroupType, domainOrWorkspaceId: string): Promise<Attachment<FileModel>> => {
    try {
        const uploadInfo = await getUploadInfo(file, resourceGroup, domainOrWorkspaceId);
        await uploadFile(uploadInfo.upload_url, uploadInfo.upload_options, file);
        const fileModel = await getUploadedFile(uploadInfo.file_id);
        return {
            downloadUrl: fileModel.download_url as string,
            fileId: fileModel.file_id,
            data: fileModel,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            downloadUrl: `${window.location.origin}/images/no-image.png`,
            fileId: '',
        };
    }
};
