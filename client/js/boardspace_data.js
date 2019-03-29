// define connections between board spaces
connections = [ // should move this to external text file
[1], // apache junction
[0, 2, 14, 15], // space outside apache junction
[1, 3], 
[2, 4],
[3, 5, 6], // tortilla flats
[4], // top-left trading post
[4, 7],
[6, 8],
[7, 9, 20],
[8, 10, 11, 20],
[9], // top-right trading post
[9, 12, 20, 22],
[11, 13, 14], // Tom Canyon Ford - 12
[12, 21, 22], // bottom-right trading post - 13
[12, 1, 21], // - 14
[1, 16], // start of plateau trail
[15, 17],
[16, 18],
[17, 19],
[18, 20],
[19, 8, 9, 11], // Dutchman goldmine
[14, 13, 22],
[13, 11, 21]
];
// console.log(connections);

// define board spaces relative to size of original image
var spaces = [ // should move this to external text file
[26, 587,  19, 595,  18, 774,  25, 782,  212, 783,  219, 774,  218, 596,  209, 586], // apache junction

[35, 508,  35, 586,  209, 586,  218, 596,  218, 770,  302, 770,  302, 508], // space outside apache junction

[35, 378,  35, 508,  190, 508,  190, 378], // high country trail
[35, 245,  35, 378,  190, 378, 190, 245],

[35, 141,  34, 246,  246, 246,  246, 32,  136, 32], // tortilla flats
[90, 88, 75], // top-left trading post

[247, 32,  247, 182,  364, 182,  364, 32],
[365, 32,  365, 182,  479, 182,  479, 32],
[480, 32,  480, 182,  504, 166,  539, 180,  542, 148,  566, 176,  582, 148,  598, 179,  594, 32],

[673, 32,  595, 32,  598, 179,  627, 155,  631, 190,  662, 188,  656, 214,  771, 209,  772, 136], // space outside top-right trading post
[720, 88, 75], // top-right trading post
[604, 365,  606, 534,  730, 534,  730, 210,  656, 214,  685, 216,  671, 236,  698, 250,  671, 272,  692, 304,  659, 308,  655, 345,  624, 330,  604, 365], // right-most space

[773, 660,  771, 532,  541, 532,  541, 768,  673, 768], // Tom Canyon Ford
[720, 712, 75], // bottom-right trading post
[302, 615,  302, 770,  540, 770,  540, 615], // low country trail

[201, 502,  301, 502,  300, 594,  365, 531,  267, 435], // plateau trail
[267, 435,  365, 531,  417, 479,  318, 382],
[318, 382,  417, 479,  468, 426,  371, 329],
[371, 329,  468, 426,  521, 374,  423, 276],
[423, 276,  521, 374,  554, 340,  553, 337,  526, 347,  525, 320,  494, 318,  500, 293,  477, 279,  494, 266,  467, 243,  500, 232,  484, 212],

[514, 205,  477, 202,  500, 232,  467, 243,  494, 266,  477, 279,  500, 293,  494, 318,  525, 320,  526, 347,  553, 337,  554, 340,  568, 358,  590, 338, // gold mine
604, 365,  624, 330,  655, 345,  659, 308,  692, 304,  671, 272,  698, 250,  671, 236,  685, 216,  656, 214,
662, 188,  631, 190,  627, 155,  598, 179,  582, 148,  566, 176,  542, 148,  539, 180,  504, 166,  512, 199], // Dutchman gold mine
[540, 566,  542, 768,  673, 766,  661, 753,  660, 749,  652, 737,  647, 720,  647, 703,  652, 687,  640, 665,  628, 648,  604, 616,  577, 590,  540, 566], // Tom Canyon Ford left side
[540, 550,  580, 560,  632, 585,  656, 592,  720, 635,  734, 637,  756, 644,  774, 658,  773, 530,  540, 532] // Tom Canyon Ford right side
];

var icon_spot = [
[119, 684], // apache junction
[262, 544], 
[113, 443], // high country trail
[113, 310],
[190, 190], // tortilla flats
[90, 88], // top-left trading post
[305, 107],
[422, 107],
[537, 107],
[660, 160], 
[720, 88], // top-right trading post
[668, 440], // right-most space
[628, 608], // Tom Canyon Ford
[720, 712], // bottom-right trading post
[421, 692], // low country trail
[310, 495], // plateau trail
[348, 460],
[396, 405],
[446, 352],
[476, 302],
[580, 255],
[588, 690], // Tom Canyon Ford left side
[722, 572] // Tom Canyon Ford right side
];

// [588, 690], [722, 572]

// [540, 566,  542, 768,  673, 766,  661, 753,  660, 749,  652, 737,  647, 720,  647, 703,  652, 687,  640, 665,  628, 648,  604, 616,  577, 590,  540, 566],
// [540, 550,  580, 560,  632, 585,  656, 592,  720, 635,  734, 637,  756, 644,  774, 658,  773, 530,  540, 532]



function normalize(boardwidth, boardheight) {
    for (i = 0; i < spaces.length; i++) {
      for (j = 0; j < spaces[i].length; j++) {
         if (j % 2 == 0) {
            spaces[i][j] = spaces[i][j] * boardwidth / 800;
         }
         else {
            spaces[i][j] = spaces[i][j] * boardheight / 795;
         }
      }
   }
   for (i = 0; i < icon_spot.length; i++) {
      icon_spot[i][0] = icon_spot[i][0] * boardwidth / 800;
      icon_spot[i][1] = icon_spot[i][1] * boardheight / 795;
   }
}

