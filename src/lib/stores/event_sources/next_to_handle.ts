//this file should provide all the next notes that should be handled (in order, if a correct order is required)

// export const consensusNotes = derived(mempoolEvents, ($vce) => {
//     $vce = $vce.filter((event: NDKEvent) => {
//       return validate(event, get(consensusTipState));
//     });

//     $vce = $vce.filter((event: NDKEvent) => {
//       //event previous label == HEAD
//       //todo track mutiple HEADs so that we can follow multiple pubkeys:
//       //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
//       return (
//         get(consensusTipState).LastConsensusEvent() ==
//         labelledTag(event, "previous", "e")
//       );
//     });
//     return $vce;
//   });
