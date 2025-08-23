export interface ProposalData {
  id: number;
  title: string;
  description: string;
  proposer: string;
  amount: string;
  votesFor: number;
  votesAgainst: number;
  deadline: number;
  active: boolean;
  status: number;
  userHasVoted: boolean;
  userVotedYes: boolean;
  projectLinks: string[];
  projectLink: string;
  projectImageLink: string;
  projectVideoLink: string;
  projectTwitterLink: string;
  deadlineForApproval: number;
  createdDate: number;
  canActivate: boolean;
  projectStatus?: number; // Add this field for project status
}
