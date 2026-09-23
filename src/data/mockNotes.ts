import { Note } from '../types/notes';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-bst',
    title: 'Binary Search Trees & AVL Balance Properties',
    subject: 'Data Structures',
    topic: 'Trees & Self-Balancing Data Structures',
    author: {
      name: 'Elena Rostova',
      institution: 'MIT EECS',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Sep 18, 2026',
    readabilityRating: 4.95,
    legibilityScore: 99,
    upvotes: 482,
    views: 3120,
    totalPages: 3,
    summary: 'Comprehensive handwritten guide on BST node insertion, deletion edge cases (leaf, single child, two children via in-order predecessor), and AVL rotations (LL, RR, LR, RL) with height balance factor proof.',
    tags: ['Binary Search Tree', 'AVL Trees', 'Rotations', 'Time Complexity', 'Recursion'],
    pages: [
      {
        id: 'bst-p1',
        pageNumber: 1,
        title: 'BST Properties & Node Invariant',
        paperType: 'ruled',
        inkColor: 'blue',
        ocrContent: {
          title: 'Binary Search Trees: Definitions & Invariants',
          rawText: `Definition: A binary tree where for every node X:
- All keys in left subtree(X) < key(X)
- All keys in right subtree(X) > key(X)
- Left and right subtrees must also be binary search trees.

Operations:
- Search(k): Compare k with root. If k < root, recurse left; else right. O(h) where h is height.
- Insert(k): Find proper leaf insertion point. Maintains BST invariant. O(h).
- Min / Max: Traversal to leftmost or rightmost node. O(h).

Worst Case: Skewed Tree (degenerate chain) -> h = O(N) -> O(N) operations.
Balanced Case: Complete binary tree -> h = floor(log2(N)) -> O(log N) operations.`,
          sections: [
            {
              heading: '1. The BST Invariant',
              content: 'For any node X, all elements in Left(X) are strictly smaller than X.val, and all elements in Right(X) are strictly greater than X.val.',
              type: 'text',
            },
            {
              heading: '2. Search & Insertion Algorithm',
              content: `TreeNode* search(TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    if (val < root->val) return search(root->left, val);
    return search(root->right, val);
}`,
              type: 'code',
            },
            {
              heading: '3. Height Bounds',
              content: 'log_2(n+1) <= h <= n. To prevent worst-case O(n) degeneration, self-balancing mechanisms like AVL or Red-Black are required.',
              type: 'formula',
            },
          ],
          latexFormulas: [
            '\\forall y \\in \\text{Left}(x): \\text{key}(y) < \\text{key}(x)',
            '\\forall z \\in \\text{Right}(x): \\text{key}(z) > \\text{key}(x)',
            'h_{\\text{min}} = \\lfloor \\log_2 n \\rfloor, \\quad h_{\\text{max}} = n',
          ],
          keyTerms: ['BST Invariant', 'Time Complexity O(h)', 'Degenerate Tree', 'Leaf Insertion'],
        },
        visualContent: {
          headerTitle: 'DATA STRUCTURES: BINARY SEARCH TREES',
          dateText: 'Lecture 08 · MIT 6.006',
          sections: [
            {
              heading: 'Fundamental Invariant',
              highlight: 'yellow',
              paragraphs: [
                'Every node x satisfies: Left subtree keys < Key(x) < Right subtree keys.',
                'In-order traversal (Left -> Node -> Right) yields sorted ascending sequence!',
              ],
              diagramType: 'bst',
              sideMarginNote: 'Remember: Duplicate keys usually disallowed or kept in frequency counters.',
            },
            {
              heading: 'Time Complexities',
              highlight: 'cyan',
              paragraphs: [
                'Search: O(h) | Insert: O(h) | Delete: O(h)',
                'Worst case (ordered inserts: 1, 2, 3...): Degenerates to linked list => h = O(n)',
                'Best/Average case (random inputs): Height h = O(log n)',
              ],
              annotations: ['Goal: Keep height h bounded by O(log n) at all times! -> AVL'],
            },
          ],
        },
      },
      {
        id: 'bst-p2',
        pageNumber: 2,
        title: 'Node Deletion (3 Cases) & In-order Successor',
        paperType: 'ruled',
        inkColor: 'darkblue',
        ocrContent: {
          title: 'BST Node Deletion Algorithm (Hibbard Deletion)',
          rawText: `Deleting a node z from BST involves three cases:
Case 1: z has no children (Leaf node).
-> Simply disconnect parent pointer to z. Free(z).

Case 2: z has only ONE child.
-> Splice out z by linking parent(z) directly to child(z).

Case 3: z has TWO children.
-> Find in-order successor y = min(z.right) (or predecessor max(z.left)).
-> Copy y.val into z.val.
-> Recursively delete node y from right subtree (which has at most one child).`,
          sections: [
            {
              heading: 'Deletion Logic',
              content: 'Handling 0, 1, or 2 children. In the two-child case, the in-order successor is guaranteed to have NO left child, simplifying its subsequent deletion.',
              type: 'text',
            },
          ],
          latexFormulas: ['y = \\text{Tree-Minimum}(z.\\text{right})'],
          keyTerms: ['Hibbard Deletion', 'In-order Successor', 'Two-child splicing'],
        },
        visualContent: {
          headerTitle: 'DELETION IN BST: THE 3 CASES',
          dateText: 'Lecture 08 (cont.)',
          sections: [
            {
              heading: 'Case 1: Node has NO children',
              paragraphs: ['Easy case: Just remove node and set parent pointer to NULL.'],
            },
            {
              heading: 'Case 2: Node has 1 child',
              paragraphs: ['Bypass node: Link parent directly to existing child (left or right).'],
            },
            {
              heading: 'Case 3: Node has 2 children',
              highlight: 'pink',
              paragraphs: [
                'Find smallest node in Right Subtree = In-Order Successor!',
                'Swap values: replace target value with successor value.',
                'Delete original successor from right subtree (now reduced to Case 1 or 2).',
              ],
              sideMarginNote: 'Crucial: Successor never has a left child!',
            },
          ],
        },
      },
      {
        id: 'bst-p3',
        pageNumber: 3,
        title: 'AVL Trees & Rotations (LL, RR, LR, RL)',
        paperType: 'ruled',
        inkColor: 'blue',
        ocrContent: {
          title: 'AVL Self-Balancing Trees: Balance Factor & Rotations',
          rawText: `AVL Tree Definition:
For every node x, the Balance Factor BF(x) is:
BF(x) = height(Left(x)) - height(Right(x))
Condition: BF(x) in {-1, 0, 1}.

If |BF(x)| > 1 after insertion/deletion, perform rotations:
1. Left-Left (LL): Single Right Rotation.
2. Right-Right (RR): Single Left Rotation.
3. Left-Right (LR): Left Rotate child, then Right Rotate node.
4. Right-Left (RL): Right Rotate child, then Left Rotate node.

Guarantee: Maximum height h < 1.44 log2(N). Guaranteed O(log N) lookup.`,
          sections: [
            {
              heading: 'Rotations Summary',
              content: 'Four rebalancing cases restore BF to {-1, 0, +1} in O(1) time per rotation.',
              type: 'text',
            },
          ],
          latexFormulas: [
            'BF(x) = h(L) - h(R) \\in \\{-1, 0, +1\\}',
            'h_{\\text{AVL}} \\le 1.4404 \\log_2(n + 2) - 0.328',
          ],
          keyTerms: ['Balance Factor', 'LL / RR Rotation', 'LR / RL Double Rotation'],
        },
        visualContent: {
          headerTitle: 'AVL BALANCING & ROTATIONS',
          dateText: 'Self-Balancing Invariants',
          sections: [
            {
              heading: 'Balance Factor Calculation',
              highlight: 'green',
              paragraphs: [
                'BF = Height(Left) - Height(Right). Must remain in {-1, 0, 1}.',
                'If BF = +2 and Left child BF >= 0 -> LL Case -> Single Right Rotate(A).',
                'If BF = -2 and Right child BF <= 0 -> RR Case -> Single Left Rotate(A).',
                'If BF = +2 and Left child BF < 0 -> LR Case -> LeftRotate(B) then RightRotate(A).',
              ],
              annotations: ['Single rotation restores height invariance in O(1) pointer updates!'],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-linalg',
    title: 'Linear Algebra: Eigenvalues & Diagonalization',
    subject: 'Mathematics',
    topic: 'Spectral Theorem & Matrix Decompositions',
    author: {
      name: 'Julian Vance',
      institution: 'Stanford Math',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Sep 12, 2026',
    readabilityRating: 4.98,
    legibilityScore: 99,
    upvotes: 620,
    views: 4410,
    totalPages: 2,
    summary: 'Meticulous notes with step-by-step characteristic equation solving, algebraic vs geometric multiplicity, diagonalization condition A = S Λ S⁻¹, and symmetric matrix orthogonality.',
    tags: ['Eigenvalues', 'Eigenvectors', 'Diagonalization', 'Spectral Theorem', 'Matrices'],
    pages: [
      {
        id: 'linalg-p1',
        pageNumber: 1,
        title: 'The Characteristic Equation & Eigenpairs',
        paperType: 'grid',
        inkColor: 'black',
        ocrContent: {
          title: 'Eigenvalues and Eigenvectors: Characteristic Polynomial',
          rawText: `Let A be an n x n square matrix.
A non-zero vector v is an eigenvector with eigenvalue lambda if:
A v = lambda v
(A - lambda I) v = 0

For non-trivial solutions v != 0, the matrix (A - lambda I) must be singular:
det(A - lambda I) = 0   <-- Characteristic Equation.

Roots of the characteristic polynomial p(lambda) = 0 yield the eigenvalues lambda_1, lambda_2, ...
For each eigenvalue lambda_i, find the eigenspace:
E_(lambda_i) = Null(A - lambda_i I).`,
          sections: [
            {
              heading: '1. Characteristic Equation',
              content: 'det(A - lambda * I) = 0. Solving this nth-degree polynomial yields the eigenvalues.',
              type: 'formula',
            },
            {
              heading: '2. Multiplicities',
              content: 'Algebraic multiplicity (AM): multiplicity of lambda as a root of det(A - lambda I) = 0.\nGeometric multiplicity (GM): dimension of Null(A - lambda I). Always 1 <= GM <= AM.',
              type: 'text',
            },
          ],
          latexFormulas: [
            'A \\mathbf{v} = \\lambda \\mathbf{v} \\iff (A - \\lambda I)\\mathbf{v} = \\mathbf{0}',
            'p(\\lambda) = \\det(A - \\lambda I) = 0',
            '1 \\le \\text{dim}(\\text{Null}(A - \\lambda I)) \\le \\text{mult}_{\\text{alg}}(\\lambda)',
          ],
          keyTerms: ['Eigenvalue', 'Eigenvector', 'Characteristic Polynomial', 'Eigenspace'],
        },
        visualContent: {
          headerTitle: 'LINEAR ALGEBRA: EIGENVALUES & EIGENVECTORS',
          dateText: 'Math 214 · Week 6',
          sections: [
            {
              heading: 'Core Eigenvector Equation',
              highlight: 'yellow',
              paragraphs: [
                'A·v = λ·v  (Matrix acting on v only scales it by factor λ, no rotation!)',
                '(A - λI)v = 0  ==> Det(A - λI) = 0 must hold for non-trivial nullspace.',
              ],
              diagramType: 'matrix',
              sideMarginNote: 'Trace(A) = sum(λ_i)\nDet(A) = prod(λ_i)',
            },
            {
              heading: 'Example 2x2 Matrix',
              highlight: 'cyan',
              paragraphs: [
                'A = [[4, 1], [2, 3]]',
                'Det(A - λI) = (4-λ)(3-λ) - 2 = λ² - 7λ + 10 = (λ - 5)(λ - 2) = 0',
                'Eigenvalues: λ₁ = 5, λ₂ = 2.',
                'For λ = 5: Null(A - 5I) = Null([[-1, 1], [2, -2]]) => v₁ = [1, 1]ᵀ',
                'For λ = 2: Null(A - 2I) = Null([[2, 1], [2, 1]]) => v₂ = [-1, 2]ᵀ',
              ],
              annotations: ['Check: Trace = 4+3 = 7 = 5+2. Det = 12-2 = 10 = 5*2. Perfect!'],
            },
          ],
        },
      },
      {
        id: 'linalg-p2',
        pageNumber: 2,
        title: 'Matrix Diagonalization & Powers A^k',
        paperType: 'grid',
        inkColor: 'black',
        ocrContent: {
          title: 'Matrix Diagonalization: A = S Λ S⁻¹',
          rawText: `Diagonalization Theorem:
An n x n matrix A is diagonalizable if and only if it has n linearly independent eigenvectors.
This occurs when GM(lambda) = AM(lambda) for all eigenvalues.

Construction:
S = [v_1  v_2  ...  v_n]  (Columns are eigenvectors)
Lambda = diag(lambda_1, lambda_2, ..., lambda_n)

Then:
A S = S Lambda  =>  A = S Lambda S^(-1)

Computing Powers of A:
A^k = (S Lambda S^(-1))^k = S Lambda^k S^(-1)
Where Lambda^k = diag(lambda_1^k, ..., lambda_n^k). Extremely fast: O(1) vs O(k*n^3)!`,
          sections: [
            {
              heading: 'Diagonalization Condition',
              content: 'A is diagonalizable iff geometric multiplicity matches algebraic multiplicity for every distinct eigenvalue.',
              type: 'text',
            },
          ],
          latexFormulas: [
            'A = S \\Lambda S^{-1} \\quad \\text{where } S = [\\mathbf{v}_1 \\; \\mathbf{v}_2 \\; \\dots \\; \\mathbf{v}_n]',
            'A^k = S \\begin{bmatrix} \\lambda_1^k & & 0 \\\\ & \\ddots & \\\\ 0 & & \\lambda_n^k \\end{bmatrix} S^{-1}',
          ],
          keyTerms: ['Diagonalization', 'Modal Matrix S', 'Matrix Exponential', 'Spectral Theorem'],
        },
        visualContent: {
          headerTitle: 'DIAGONALIZATION: A = S · Λ · S⁻¹',
          dateText: 'Spectral Theorem',
          sections: [
            {
              heading: 'Why Diagonalize?',
              highlight: 'green',
              paragraphs: [
                'Decouples linear systems of differential equations.',
                'Computes matrix power A^k in O(1) once S and S⁻¹ are known!',
                'Symmetric matrices (A = Aᵀ) always have real eigenvalues and orthogonal eigenvectors: A = Q Λ Qᵀ.',
              ],
              sideMarginNote: 'Q⁻¹ = Qᵀ for orthogonal matrices!',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-os',
    title: 'Operating Systems: Virtual Memory & Page Tables',
    subject: 'Operating Systems',
    topic: 'Memory Management, TLB & Paging',
    author: {
      name: 'Marcus Brody',
      institution: 'Carnegie Mellon',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Sep 10, 2026',
    readabilityRating: 4.88,
    legibilityScore: 96,
    upvotes: 395,
    views: 2850,
    totalPages: 2,
    summary: 'Clear diagrammatic breakdown of virtual address translation (VPN + Offset to PPN + Offset), multi-level page tables, TLB hits/misses, and page fault handling routines.',
    tags: ['Virtual Memory', 'Paging', 'TLB', 'Page Tables', 'MMU', 'Address Translation'],
    pages: [
      {
        id: 'os-p1',
        pageNumber: 1,
        title: 'Virtual Address Translation Mechanics',
        paperType: 'legal',
        inkColor: 'darkblue',
        ocrContent: {
          title: 'Virtual Memory & Address Translation',
          rawText: `Virtual Memory Goals:
1. Isolation & Protection: Prevent processes from reading/writing other memory.
2. Illusion of large, contiguous memory space.
3. Efficient sharing of libraries via shared pages.

Hardware Address Translation:
Virtual Address (VA) split into:
[ Virtual Page Number (VPN) | Page Offset (VPO) ]

Physical Address (PA) split into:
[ Physical Page Number (PPN) | Page Offset (PPO) ]

Note: Page Offset is NEVER translated! Size = log2(Page Size).
For 4KB pages: offset is 12 bits (2^12 = 4096).
MMU looks up VPN in Page Table to retrieve PPN, then attaches unchanged offset.`,
          sections: [
            {
              heading: 'Address Format',
              content: 'VA = [VPN: 20 bits] [Offset: 12 bits] for 32-bit architecture with 4KB pages.',
              type: 'formula',
            },
          ],
          latexFormulas: [
            '\\text{Offset Bits} = \\log_2(\\text{Page Size}) = \\log_2(4096) = 12',
            '\\text{PA} = (\\text{PPN} \\ll 12) \\mid \\text{Offset}',
          ],
          keyTerms: ['MMU', 'VPN to PPN', 'Page Table Entry (PTE)', 'Valid Bit'],
        },
        visualContent: {
          headerTitle: 'OPERATING SYSTEMS: VIRTUAL MEMORY',
          dateText: 'CS 15-213 · Lecture 14',
          sections: [
            {
              heading: 'Hardware Translation (MMU)',
              highlight: 'yellow',
              paragraphs: [
                'Virtual Address is split: [ VPN (upper bits) | Offset (lower 12 bits) ]',
                'Page Size = 4 KB = 2¹² bytes  ==>  Offset is always exactly 12 bits!',
                'VPN indexes into Process Page Table => returns PPN + permission bits (R/W/X).',
              ],
              diagramType: 'paging',
              sideMarginNote: 'Offset never changes during translation: VPO == PPO always!',
            },
            {
              heading: 'Page Table Entry (PTE) Flags',
              highlight: 'cyan',
              paragraphs: [
                'Valid Bit (V): 1 if page in physical RAM, 0 if on disk (Page Fault!).',
                'Dirty Bit (D): 1 if modified, must write back to disk upon eviction.',
                'Reference/Access Bit (R): used by clock / LRU replacement algorithm.',
              ],
            },
          ],
        },
      },
      {
        id: 'os-p2',
        pageNumber: 2,
        title: 'TLB (Translation Lookaside Buffer) & Multi-Level Tables',
        paperType: 'legal',
        inkColor: 'darkblue',
        ocrContent: {
          title: 'TLB Cache & Hierarchical Page Tables',
          rawText: `The Problem: Accessing page table in DRAM adds +1 memory access latency per lookup!
Solution: TLB (Translation Lookaside Buffer) - fast hardware associative cache on CPU chip.

Access Flow:
1. CPU sends VA.
2. MMU checks TLB for VPN.
   - TLB HIT: Retrieve PPN in ~0.5 ns!
   - TLB MISS: Access Page Table in memory, update TLB, retry.

Multi-Level Page Tables:
Single level table for 64-bit space requires Petabytes!
Hierarchy (e.g. 4-level x86-64: PML4 -> PDPT -> PD -> PT):
Unallocated regions need NO lower-level page tables, saving 99% RAM!`,
          sections: [
            {
              heading: 'Effective Access Time (EAT)',
              content: 'EAT = Hit_rate * (TLB_time + Memory_time) + (1 - Hit_rate) * (TLB_time + 2 * Memory_time).',
              type: 'formula',
            },
          ],
          latexFormulas: [
            '\\text{EAT} = h \\cdot (t_{\\text{tlb}} + t_{\\text{mem}}) + (1 - h) \\cdot (t_{\\text{tlb}} + (k + 1)t_{\\text{mem}})',
          ],
          keyTerms: ['TLB Hit Ratio', 'Page Fault Handler', 'Hierarchical Paging'],
        },
        visualContent: {
          headerTitle: 'TLB CACHE & MULTI-LEVEL TABLES',
          dateText: 'Memory Hierarchy',
          sections: [
            {
              heading: 'TLB Speedup',
              highlight: 'green',
              paragraphs: [
                'TLB Hit: ~1 cycle latency. Hit rate typically 99%+ with spatial locality.',
                'TLB Miss: Page table walk (4 memory references on x86-64).',
                'Page Fault: Trap to OS kernel, I/O disk fetch (~10 milliseconds!).',
              ],
              annotations: ['Page fault penalty is ~100,000x slower than RAM access!'],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-orgo',
    title: 'Organic Chemistry: Electrophilic Aromatic Substitution (EAS)',
    subject: 'Chemistry',
    topic: 'Benzene Mechanisms & Directing Groups',
    author: {
      name: 'Sofia Al-Hassan',
      institution: 'UC Berkeley Chemistry',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Sep 05, 2026',
    readabilityRating: 4.96,
    legibilityScore: 98,
    upvotes: 512,
    views: 3740,
    totalPages: 2,
    summary: 'Stunning hand-drawn benzene resonance structures, sigma complex (arenium ion), activating vs deactivating substituent effects, and ortho/para vs meta directing mechanisms.',
    tags: ['Benzene', 'EAS', 'Resonance', 'Sigma Complex', 'Ortho-Para Directing', 'Organic Chemistry'],
    pages: [
      {
        id: 'orgo-p1',
        pageNumber: 1,
        title: 'EAS General Mechanism & Arenium Ion Intermediate',
        paperType: 'ruled',
        inkColor: 'blue',
        ocrContent: {
          title: 'Electrophilic Aromatic Substitution (EAS) Mechanism',
          rawText: `Step 1: Generation of Strong Electrophile (E+).
Benzene pi electrons are aromatic (stable, 4n+2 Huckel). A powerful electrophile is required.
Examples:
- Nitration: HNO3 + H2SO4 -> NO2+ (Nitronium ion)
- Halogenation: Br2 + FeBr3 -> Br+ ... FeBr4-
- Friedel-Crafts: R-Cl + AlCl3 -> R+ + AlCl4-

Step 2: Attack of Benzene Pi Bond on Electrophile (Rate-Determining Step).
Forms the non-aromatic Arenium Ion (Sigma Complex / Wheland intermediate).
The positive charge is delocalized over ortho and para positions across 3 resonance contributors.

Step 3: Deprotonation (Aromatization).
A weak base (e.g. HSO4-, FeBr4-) abstracts the proton at the sp3 carbon, restoring 6 pi aromatic stabilization!`,
          sections: [
            {
              heading: 'Mechanism Overview',
              content: 'Three fundamental steps: 1) Electrophile activation, 2) Arenium carbocation formation (slow), 3) Deprotonation to restore aromatic sextet (fast).',
              type: 'text',
            },
          ],
          latexFormulas: [
            '\\text{Benzene} + E^+ \\xrightarrow{\\text{slow}} [\\text{Sigma Complex}]^+ \\xrightarrow{-\\text{H}^+, \\text{fast}} \\text{Substituted Benzene}',
          ],
          keyTerms: ['Arenium Ion', 'Sigma Complex', 'Rate Limiting Step', 'Aromatic Sextet'],
        },
        visualContent: {
          headerTitle: 'ORGANIC CHEMISTRY: EAS MECHANISMS',
          dateText: 'Chem 3B · Benzene Chemistry',
          sections: [
            {
              heading: 'General 3-Step Reaction Pathway',
              highlight: 'yellow',
              paragraphs: [
                '1. Form super-electrophile: E⁺ (e.g., NO₂⁺ from HNO₃/H₂SO₄)',
                '2. Benzene π-cloud attacks E⁺: forms SIGMA COMPLEX (slow, breaks aromaticity!)',
                '3. Base removes H⁺: Aromaticity RESTORED (fast, thermodynamically favored!)',
              ],
              diagramType: 'benzene',
              sideMarginNote: 'Notice: Substitution occurs, NOT addition, to preserve 36 kcal/mol resonance stabilization!',
            },
          ],
        },
      },
      {
        id: 'orgo-p2',
        pageNumber: 2,
        title: 'Substituent Directing Groups (Ortho/Para vs Meta)',
        paperType: 'ruled',
        inkColor: 'blue',
        ocrContent: {
          title: 'Directing Effects & Activating/Deactivating Groups',
          rawText: `Ortho/Para Directors (Activating):
- -OH, -NH2, -OCH3 (Strong Activators, donate electrons via resonance lone pair)
- -Alkyl groups (-CH3) (Weak Activators, donate via hyperconjugation / induction)
- Halogens (-F, -Cl, -Br): WEAKLY DEACTIVATING due to electronegativity (-I effect), but ORTHO/PARA directing because lone pairs can stabilize the sigma complex!

Meta Directors (Deactivating):
- -NO2, -CN, -COOH, -CHO, -CF3
Strongly electron-withdrawing groups pull electron density out of the ring.
Attack at ortho/para places positive charge directly adjacent to partial positive carbonyl/nitro carbon -> highly unstable!
Thus meta attack is the least disfavored pathway.`,
          sections: [
            {
              heading: 'Directing Summary',
              content: 'Activators donate electron density to ring (ortho/para). Strong deactivators destabilize ortho/para sigma complex, directing incoming electrophiles to meta.',
              type: 'text',
            },
          ],
          keyTerms: ['Activating Group', 'Deactivating Group', 'Ortho/Para Director', 'Meta Director'],
        },
        visualContent: {
          headerTitle: 'DIRECTING GROUPS & REACTIVITY',
          dateText: 'Substituent Effects',
          sections: [
            {
              heading: 'Activating vs Deactivating Trends',
              highlight: 'pink',
              paragraphs: [
                'Activators (o,p): -NH₂ > -OH > -OR > -NHCOR > -R (Alkyl)',
                'Deactivators (m): -NO₂ > -NR₃⁺ > -CF₃ > -CN > -SO₃H > -CHO > -COOR',
                'Halogens Special Case: Deactivating (-I) yet ortho/para directing (+M resonance)!',
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-ee',
    title: 'Electrical Engineering: AC RLC Circuits & Resonance',
    subject: 'Electrical Engineering',
    topic: 'Phasor Analysis, Quality Factor & Bandwidth',
    author: {
      name: 'Devin Thorne',
      institution: 'Georgia Tech ECE',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Sep 02, 2026',
    readabilityRating: 4.91,
    legibilityScore: 97,
    upvotes: 430,
    views: 2990,
    totalPages: 2,
    summary: 'Detailed phasor diagrams, impedance formulas for series and parallel RLC networks, resonant frequency derivations, quality factor Q, and 3dB half-power bandwidth calculations.',
    tags: ['RLC Circuit', 'Phasors', 'Resonance', 'Impedance', 'Quality Factor', 'AC Circuits'],
    pages: [
      {
        id: 'ee-p1',
        pageNumber: 1,
        title: 'Series RLC Impedance & Resonance Derivation',
        paperType: 'grid',
        inkColor: 'blue',
        ocrContent: {
          title: 'Series RLC Circuit Impedance and Resonance',
          rawText: `Impedances in Frequency Domain:
- Resistor: Z_R = R
- Inductor: Z_L = j omega L
- Capacitor: Z_C = 1 / (j omega C) = -j / (omega C)

Total Series Impedance:
Z_total = R + j (omega L - 1 / (omega C))
Magnitude: |Z| = sqrt( R^2 + (omega L - 1 / (omega C))^2 )
Phase angle: phi = arctan( (omega L - 1 / (omega C)) / R )

Resonance Condition:
Occurs when inductive and capacitive reactances cancel out:
omega_0 L = 1 / (omega_0 C)
omega_0^2 = 1 / (L C)
omega_0 = 1 / sqrt(L C)  (rad/sec)
f_0 = 1 / (2 pi sqrt(L C))  (Hz)

At resonance:
- Impedance is purely resistive: Z = R (minimum impedance!)
- Current amplitude I_max = V_s / R is maximized.
- Voltage across L and C can be Q times larger than source voltage!`,
          sections: [
            {
              heading: 'Impedance Formula',
              content: 'Z = R + j(wL - 1/wC). At resonance w_0 = 1/sqrt(LC), reactive part is 0.',
              type: 'formula',
            },
          ],
          latexFormulas: [
            'Z_{\\text{total}} = R + j\\left(\\omega L - \\frac{1}{\\omega C}\\right)',
            '\\omega_0 = \\frac{1}{\\sqrt{LC}}, \\quad f_0 = \\frac{1}{2\\pi \\sqrt{LC}}',
            'I_0 = \\frac{V_s}{R} \\quad (\\text{Current peak at resonance})',
          ],
          keyTerms: ['Resonance Frequency', 'Phasor Domain', 'Complex Impedance', 'Reactance Cancellation'],
        },
        visualContent: {
          headerTitle: 'ELECTRICAL CIRCUITS: SERIES RLC',
          dateText: 'ECE 2026 · Phasor Analysis',
          sections: [
            {
              heading: 'Circuit Model & Phasors',
              highlight: 'yellow',
              paragraphs: [
                'Z_R = R | Z_L = jωL (leads 90°) | Z_C = -j/(ωC) (lags 90°)',
                'Net reactive component: X = ωL - 1/(ωC)',
                'When X = 0: Series Resonance! Z reaches MINIMUM = R.',
              ],
              diagramType: 'rlc',
              sideMarginNote: 'V_L and V_C are 180° out of phase and cancel out completely at ω₀!',
            },
          ],
        },
      },
      {
        id: 'ee-p2',
        pageNumber: 2,
        title: 'Quality Factor Q & Bandwidth (BW)',
        paperType: 'grid',
        inkColor: 'blue',
        ocrContent: {
          title: 'Quality Factor Q and Half-Power Bandwidth',
          rawText: `Quality Factor Q definition:
Q = 2 pi * (Maximum Energy Stored / Energy Dissipated per Cycle)
For Series RLC:
Q = (omega_0 L) / R = 1 / (omega_0 R C) = (1 / R) * sqrt(L / C)

Half-Power Frequencies (omega_1, omega_2):
Frequencies where power drops to half (current drops to I_max / sqrt(2), -3dB):
Bandwidth BW = Delta omega = omega_2 - omega_1 = omega_0 / Q

High Q (Q > 10):
- Narrow bandwidth (sharp selective filter)
- omega_1, omega_2 approx omega_0 +- BW / 2`,
          sections: [
            {
              heading: 'Bandwidth & Selectivity',
              content: 'BW = w_0 / Q. Higher Q yields tighter radio receiver tuning.',
              type: 'text',
            },
          ],
          latexFormulas: [
            'Q = \\frac{\\omega_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}',
            '\\text{BW} = \\Delta \\omega = \\omega_2 - \\omega_1 = \\frac{\\omega_0}{Q}',
          ],
          keyTerms: ['Quality Factor Q', 'Bandwidth BW', 'Half-Power Frequencies -3dB'],
        },
        visualContent: {
          headerTitle: 'QUALITY FACTOR & BANDWIDTH',
          dateText: 'Filter Characteristics',
          sections: [
            {
              heading: 'Selectivity Curve',
              highlight: 'cyan',
              paragraphs: [
                'Q measures energy storage vs dissipation per oscillation.',
                'Bandwidth BW = f₀ / Q. High Q means razor-sharp frequency selectivity.',
                'At half-power points ω₁ and ω₂, |Z| = √2 · R.',
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-dijkstra',
    title: "Algorithms: Dijkstra's Shortest Path & Priority Queues",
    subject: 'Computer Science',
    topic: 'Graph Algorithms & Greedy Strategies',
    author: {
      name: 'Maya Lin',
      institution: 'Cornell CIS',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Aug 28, 2026',
    readabilityRating: 4.93,
    legibilityScore: 98,
    upvotes: 560,
    views: 4120,
    totalPages: 2,
    summary: 'Greedy proof of correctness, relaxation formula, min-heap priority queue implementation complexity O((V + E) log V), and why negative edge weights cause Dijkstra to fail.',
    tags: ['Dijkstra', 'Graph Theory', 'Greedy', 'Shortest Path', 'Min-Heap', 'Algorithms'],
    pages: [
      {
        id: 'dijk-p1',
        pageNumber: 1,
        title: "Dijkstra's Algorithm & Relaxation Invariant",
        paperType: 'ruled',
        inkColor: 'darkblue',
        ocrContent: {
          title: "Dijkstra's Single-Source Shortest Path Algorithm",
          rawText: `Problem: Given directed weighted graph G=(V, E) with non-negative edge weights w(u, v) >= 0, find shortest paths from source s to all vertices v in V.

Invariant: Maintain a set S of vertices whose final shortest-path weights delta(s, v) have already been determined.
Greedy Choice: At each step, select vertex u in V \\ S with minimum tentative distance dist[u], add u to S, and relax all outgoing edges (u, v).

Edge Relaxation:
relax(u, v, w):
    if dist[v] > dist[u] + w(u, v):
        dist[v] = dist[u] + w(u, v)
        parent[v] = u
        decrease_key(Q, v, dist[v])`,
          sections: [
            {
              heading: 'Relaxation Step',
              content: 'Relaxation checks if routing through node u improves distance estimate to neighbor v.',
              type: 'code',
            },
          ],
          latexFormulas: [
            '\\text{dist}[v] = \\min(\\text{dist}[v], \\; \\text{dist}[u] + w(u, v))',
            'T(V, E) = O(|V| \\cdot T_{\\text{extract-min}} + |E| \\cdot T_{\\text{decrease-key}})',
          ],
          keyTerms: ['Edge Relaxation', 'Greedy Choice', 'Min-Heap Priority Queue', 'Invariant'],
        },
        visualContent: {
          headerTitle: "ALGORITHMS: DIJKSTRA'S SHORTEST PATH",
          dateText: 'CS 4820 · Graph Theory',
          sections: [
            {
              heading: 'Greedy Step & Invariant',
              highlight: 'yellow',
              paragraphs: [
                'Initialize dist[s] = 0, all other dist[v] = infinity.',
                'Extract min node u from Priority Queue: guaranteed optimal dist[u]!',
                'Relax each neighbor v: if dist[v] > dist[u] + w(u,v) -> update!',
              ],
              diagramType: 'dijkstra',
              sideMarginNote: 'Fails with negative edge weights! Use Bellman-Ford for negative weights.',
            },
          ],
        },
      },
      {
        id: 'dijk-p2',
        pageNumber: 2,
        title: 'Priority Queue Implementations & Complexity',
        paperType: 'ruled',
        inkColor: 'darkblue',
        ocrContent: {
          title: 'Complexity Comparison: Array vs Binary Heap vs Fibonacci Heap',
          rawText: `Complexity breakdown:
- |V| Extract-Min operations
- |E| Decrease-Key operations

1. Unsorted Array:
   - Extract-Min: O(V) -> Total O(V^2)
   - Decrease-Key: O(1) -> Total O(E)
   -> Best for dense graphs where |E| approx |V|^2.

2. Binary Min-Heap:
   - Extract-Min: O(log V) -> Total O(V log V)
   - Decrease-Key: O(log V) -> Total O(E log V)
   -> Total: O((V + E) log V). Standard library implementation!

3. Fibonacci Heap:
   - Extract-Min: O(log V) amortized
   - Decrease-Key: O(1) amortized
   -> Total: O(V log V + E). Theoretically optimal!`,
          sections: [
            {
              heading: 'Data Structure Tradeoffs',
              content: 'Binary heap achieves O((V + E) log V). Fibonacci heap lowers decrease-key to O(1) amortized.',
              type: 'text',
            },
          ],
          latexFormulas: [
            '\\text{Binary Heap: } O((|V| + |E|) \\log |V|)',
            '\\text{Fibonacci Heap: } O(|V| \\log |V| + |E|)',
          ],
          keyTerms: ['Binary Heap', 'Fibonacci Heap', 'Decrease-Key', 'Dense vs Sparse'],
        },
        visualContent: {
          headerTitle: 'DATA STRUCTURE TRADEOFFS',
          dateText: 'Complexity Analysis',
          sections: [
            {
              heading: 'Binary Heap vs Fibonacci Heap',
              highlight: 'green',
              paragraphs: [
                'Binary Heap: O((V + E) log V) - preferred in practice due to lower cache overhead.',
                'Fibonacci Heap: O(V log V + E) - optimal for theoretical analysis with large E.',
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-java',
    title: 'Java Programming: Concurrency & Thread Synchronization',
    subject: 'Computer Science',
    topic: 'Multithreading, Locks & Memory Visibility',
    author: {
      name: 'Kenji Sato',
      institution: 'University of Washington',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Aug 21, 2026',
    readabilityRating: 4.89,
    legibilityScore: 97,
    upvotes: 375,
    views: 2610,
    totalPages: 2,
    summary: 'Crisp diagrams showing race conditions, volatile keyword memory visibility (happens-before relationship), ReentrantLock vs synchronized intrinsic monitors, and deadlocks.',
    tags: ['Java', 'Concurrency', 'Threads', 'Volatile', 'Locks', 'Race Conditions'],
    pages: [
      {
        id: 'java-p1',
        pageNumber: 1,
        title: 'Race Conditions & Intrinsic Synchronization',
        paperType: 'ruled',
        inkColor: 'black',
        ocrContent: {
          title: 'Java Concurrency: Race Conditions & Synchronized Blocks',
          rawText: `Race Condition:
Occurs when multiple threads concurrently read and write shared mutable state without mutual exclusion.
Example: count++
Disassembles into 3 distinct JVM bytecode instructions:
1. getfield (Read from memory)
2. iadd (Add 1 in local CPU register)
3. putfield (Write back to shared memory)
If thread context switch happens between 1 and 3, updates are overwritten and lost!

Solution: Mutual Exclusion via synchronized:
synchronized(lockObj) {
    count++; // Atomic critical section
}
Every Java Object has an intrinsic monitor (mutex). Only one thread can hold monitor at a time.`,
          sections: [
            {
              heading: 'The 3-Step Increment Trap',
              content: 'count++ is NOT atomic. It consists of Read -> Modify -> Write.',
              type: 'text',
            },
            {
              heading: 'Synchronized Block Code',
              content: `public class Counter {
    private int count = 0;
    private final Object lock = new Object();

    public void increment() {
        synchronized(lock) {
            count++;
        }
    }
}`,
              type: 'code',
            },
          ],
          keyTerms: ['Race Condition', 'Atomic Operation', 'Intrinsic Monitor', 'Critical Section'],
        },
        visualContent: {
          headerTitle: 'JAVA: CONCURRENCY & THREADS',
          dateText: 'CSE 332 · Parallel Programming',
          sections: [
            {
              heading: 'Race Condition Anatomy',
              highlight: 'pink',
              paragraphs: [
                'count++ is NOT atomic! It is 3 ops: 1) Read, 2) Increment, 3) Write.',
                'Thread A and Thread B read count=5 simultaneously -> both write count=6!',
                'One entire increment is permanently lost!',
              ],
              diagramType: 'threads',
              sideMarginNote: 'Never expose raw mutable fields across thread boundaries.',
            },
          ],
        },
      },
      {
        id: 'java-p2',
        pageNumber: 2,
        title: 'Volatile Keyword & The Happens-Before Invariant',
        paperType: 'ruled',
        inkColor: 'black',
        ocrContent: {
          title: 'Memory Visibility & the volatile Keyword',
          rawText: `The Visibility Problem:
Modern CPUs have multi-level L1/L2/L3 caches. A thread running on Core 1 may write to a variable, but Core 2 may continue reading stale value from its local L1 cache!

The volatile Keyword:
- Guarantees visibility: writes to a volatile variable are immediately flushed to main memory.
- Reads always pull latest value from main memory.
- Prevents instruction reordering around volatile read/write (Memory Barrier).
- Note: volatile does NOT guarantee atomicity for compound operations (e.g. v++). Use AtomicInteger for atomic compound ops.`,
          sections: [
            {
              heading: 'Volatile vs Atomic',
              content: 'volatile guarantees visibility + happens-before order, but NOT mutual exclusion.',
              type: 'text',
            },
          ],
          keyTerms: ['Volatile Keyword', 'Happens-Before Relationship', 'AtomicInteger', 'Memory Barrier'],
        },
        visualContent: {
          headerTitle: 'MEMORY VISIBILITY & VOLATILE',
          dateText: 'Java Memory Model (JMM)',
          sections: [
            {
              heading: 'L1/L2 Cache vs Main RAM',
              highlight: 'cyan',
              paragraphs: [
                'Without volatile, changes made by Thread 1 stay in Core 1 CPU cache.',
                'Thread 2 on Core 2 loops forever on stale cache line!',
                'volatile forces hardware memory fence: instant visibility across all CPU cores.',
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'note-calc',
    title: "Multivariable Calculus: Green's Theorem & Vector Fields",
    subject: 'Mathematics',
    topic: 'Line Integrals, Circulation & Flux',
    author: {
      name: 'Claire Dupont',
      institution: 'Sorbonne Université',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    uploadDate: 'Aug 14, 2026',
    readabilityRating: 4.97,
    legibilityScore: 99,
    upvotes: 490,
    views: 3380,
    totalPages: 2,
    summary: "Beautifully penned geometric intuition for Green's Theorem converting closed boundary line integrals into double integrals over enclosed regions, circulation density (curl), and planar flux.",
    tags: ["Green's Theorem", 'Line Integral', 'Vector Calculus', 'Curl', 'Double Integrals', 'Mathematics'],
    pages: [
      {
        id: 'calc-p1',
        pageNumber: 1,
        title: "Green's Theorem Formulation & Geometric Intuition",
        paperType: 'grid',
        inkColor: 'blue',
        ocrContent: {
          title: "Green's Theorem: Circulation Form",
          rawText: `Theorem: Let C be a positively oriented (counterclockwise), piecewise-smooth, simple closed curve in the plane, and let D be the region bounded by C.
If F(x, y) = P(x, y) i + Q(x, y) j has continuous partial derivatives on an open region containing D, then:

oint_C (P dx + Q dy) = iint_D ( (dQ / dx) - (dP / dy) ) dA

Interpretation:
The line integral around the outer boundary equals the sum of microscopic microscopic circulations (2D curl) over every infinitesimal area element dA inside region D!
All internal micro-circulations on shared boundaries cancel out, leaving only the net macroscopic circulation along the perimeter boundary C.`,
          sections: [
            {
              heading: 'Circulation Theorem Statement',
              content: 'Closed line integral of F . dr equals the double integral of curl_z(F) over region D.',
              type: 'formula',
            },
          ],
          latexFormulas: [
            '\\oint_C (P \\, dx + Q \\, dy) = \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dA',
            '\\text{curl}_z \\mathbf{F} = \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}',
          ],
          keyTerms: ["Green's Theorem", 'Microscopic Circulation', 'Counter-Clockwise Orientation', 'Boundary Cancellation'],
        },
        visualContent: {
          headerTitle: "CALCULUS III: GREEN'S THEOREM",
          dateText: 'Vector Calculus · Week 11',
          sections: [
            {
              heading: 'Circulation Form Intuition',
              highlight: 'yellow',
              paragraphs: [
                'Integral around closed boundary C = Double integral of 2D curl over region D.',
                'Microscopic vortex loops: adjacent interior arrows point in opposite directions and CANCEL perfectly!',
                'Only boundary segments survive => boundary circulation equals total internal curl sum!',
              ],
              diagramType: 'integral',
              sideMarginNote: 'C must be traversed COUNTER-CLOCKWISE so region D is always to your left!',
            },
          ],
        },
      },
      {
        id: 'calc-p2',
        pageNumber: 2,
        title: 'Area Computation via Line Integrals',
        paperType: 'grid',
        inkColor: 'blue',
        ocrContent: {
          title: 'Computing Planar Area using Green Theorem',
          rawText: `Area of enclosed region D:
Area(D) = iint_D 1 dA
Choose P and Q such that:
(dQ / dx) - (dP / dy) = 1

Choices:
1. P = 0, Q = x  =>  Area = oint_C x dy
2. P = -y, Q = 0 =>  Area = -oint_C y dx
3. Symmetric choice: P = -y/2, Q = x/2
   => Area = (1/2) * oint_C (x dy - y dx)

Allows finding area of complex closed curves (like ellipses or astroids) by integrating around their 1D perimeter!`,
          sections: [
            {
              heading: 'Area Formulas',
              content: 'Area = (1/2) * oint_C (x dy - y dx). Solves area problems easily with parameterization.',
              type: 'formula',
            },
          ],
          latexFormulas: [
            '\\text{Area}(D) = \\frac{1}{2} \\oint_C (x \\, dy - y \\, dx)',
            '\\text{Ellipse } x = a\\cos t, \\, y = b\\sin t \\implies \\text{Area} = \\pi a b',
          ],
          keyTerms: ['Area by Line Integral', 'Planar Region', 'Ellipse Parameterization'],
        },
        visualContent: {
          headerTitle: 'AREA VIA PERIMETER INTEGRAL',
          dateText: 'Applications',
          sections: [
            {
              heading: 'Symmetric Area Formula',
              highlight: 'green',
              paragraphs: [
                'Area(D) = 1/2 ∮_C (x dy - y dx)',
                'Example: Ellipse x = a cos(t), y = b sin(t), t in [0, 2π]',
                'x dy - y dx = ab(cos²t + sin²t) dt = ab dt',
                'Area = 1/2 ∫₀²π ab dt = π · a · b. Beautiful & instantaneous!',
              ],
            },
          ],
        },
      },
    ],
  },
];
