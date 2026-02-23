import type { PostMetadataModel } from "./PostMetadataModel"
import type { ThreadModel } from "./ThreadModel"

export interface HiddenThreadModel extends ThreadModel {
    postMetadata: PostMetadataModel
}
