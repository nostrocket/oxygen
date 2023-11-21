export enum TypeOfFailure {
  HardStateFailure = 0, //halt and catch fire
  SoftStateFailure = 1, //we can usually continue
}

export enum ConsensusMode {
  Producer = 0, //we have votepower and are attempting to add an event to consensus state || we are producing an event locally and want validate before publishing
  FromConsensusEvent = 1,
  Scum = 2, //Just trust the votepower for now, and maybe roll things back if we need to
  ProvisionalScum = 3, //this does not make it into consensus yet
}
