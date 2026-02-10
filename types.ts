
export interface PHPFile {
  path: string;
  name: string;
  content: string;
  language: 'php' | 'sql' | 'apache' | 'text' | 'markdown';
}

export interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileTreeNode[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
