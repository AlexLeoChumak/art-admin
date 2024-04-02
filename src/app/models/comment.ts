export interface Comment {
  id: string;
  postId: string;
  comment: string;
  author?: string;
  createdAt: string;
  isVisibleReplyComments: boolean;
  isVisibleReplyCommentForm: boolean;
  replyComments: ReplyComments[];
}

interface ReplyComments {
  comment: string;
  createdAt: number;
  author: string;
}
