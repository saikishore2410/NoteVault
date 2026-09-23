export type Subject = 
  | 'All'
  | 'Computer Science'
  | 'Mathematics'
  | 'Physics'
  | 'Electrical Engineering'
  | 'Chemistry'
  | 'Data Structures'
  | 'Operating Systems';

export interface NotePage {
  id: string;
  pageNumber: number;
  title: string;
  paperType: 'ruled' | 'grid' | 'legal' | 'dots';
  inkColor: 'blue' | 'black' | 'darkblue' | 'violet';
  ocrContent: {
    title: string;
    rawText: string;
    sections: {
      heading: string;
      content: string;
      type?: 'text' | 'formula' | 'code' | 'diagram-description';
    }[];
    latexFormulas?: string[];
    keyTerms?: string[];
  };
  // Rendered visual elements for the page
  visualContent: {
    headerTitle: string;
    dateText: string;
    sections: {
      heading?: string;
      highlight?: 'yellow' | 'cyan' | 'pink' | 'green';
      paragraphs: string[];
      diagramType?: 'bst' | 'matrix' | 'rlc' | 'benzene' | 'paging' | 'integral' | 'dijkstra' | 'threads';
      annotations?: string[];
      sideMarginNote?: string;
    }[];
  };
}

export interface Note {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  author: {
    name: string;
    institution: string;
    avatarUrl?: string;
  };
  uploadDate: string;
  readabilityRating: number; // e.g. 4.9 (out of 5.0)
  legibilityScore: number; // percentage, e.g. 98%
  upvotes: number;
  views: number;
  totalPages: number;
  summary: string;
  tags: string[];
  pages: NotePage[];
}

export interface StudyHistoryItem {
  noteId: string;
  noteTitle: string;
  subject: Subject;
  topic: string;
  lastPageIndex: number;
  totalPages: number;
  timestamp: number; // Date.now()
}

export interface StudySession {
  lastNoteId: string;
  lastNoteTitle: string;
  lastSubject: Subject;
  lastTopic: string;
  lastPageIndex: number;
  totalPages: number;
  lastUpdated: number;
}
