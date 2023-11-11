export enum TypeOfFailure {
  HardStateFailure = 0, //halt and catch fire
  SoftStateFailure = 1, //we can usually continue
}

export enum ConsensusMode {
  Producer = 0, //we have votepower and are attempting to add an event to consensus state
  FollowerWithVotepower = 1, //we have votepower but we won't sign someone else's consensus event unless we can validate it
  Scum = 2, //Just trust the votepower for now, and maybe roll things back if we need to
}
