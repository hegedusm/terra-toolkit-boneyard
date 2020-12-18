const jsondata = {
  /*"00eb849d8a99c19d4f10224651a62437": {
    "I18n Locale": {
      parent: "I18n Locale",
      description: "I18n Locale",
      tests: [
        {
          description: "Express correctly sets the application locale",
          success: "success",
        },
        {
          description: "[default] to be within the mismatch tolerance",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/i18n-spec/I18n_Locale[default].png",
        },
      ],
    },
  },*/
  // fa372c346f402d6e30314f44107e880c: {
  //   "[huge]": {
  //     parent: "[huge]",
  //     description: "[huge]",
  //     tests: [],
  //   },
  //   validateElement: {
  //     parent: "[huge]",
  //     description: "validateElement",
  //     tests: [],
  //   },
  //   "inaccessible contrast": {
  //     parent: "validateElement",
  //     description: "inaccessible contrast",
  //     tests: [
  //       {
  //         description:
  //           "[default] is accessible and is within the mismatch tolerance",
  //         success: "success",
  //         screenshotLink:
  //           "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/inaccessible_contrast[default].png",
  //       },
  //       {
  //         description: "checks element",
  //         success: "success",
  //         screenshotLink:
  //           "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/inaccessible_contrast[default].png",
  //       },
  //     ],
  //   },
  //   "full implementation": {
  //     parent: "validateElement",
  //     description: "full implementation",
  //     tests: [
  //       {
  //         description:
  //           "[default] is accessible and is within the mismatch tolerance",
  //         success: "success",
  //         screenshotLink:
  //           "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
  //       },
  //       {
  //         description: "checks element",
  //         success: "success",
  //         screenshotLink:
  //           "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
  //       },
  //     ],
  //   },
  // },
    f75728c9953420794e669cae74b03d58: {
    hideInputCaret: {
      parent: "hideInputCaret",
      description: "hideInputCaret",
      tests: [],
    },
    group1: {
      parent: "hideInputCaret",
      description: "group1",
      tests: [
        {
          description:
            "validates the textarea's caret-color is inherited as transparent",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
        },
      ],
    },
    "group1 inner describe": {
      parent: "group1",
      description: "group1 inner describe",
      tests: [
        {
          description:
            "validates the body's caret-color is transparent by default",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
        },
      ],
    },
    group2: {
      parent: "hideInputCaret",
      description: "group2",
      tests: [
        {
          description:
            "validates the input's caret-color is inherited as transparent",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
        },
        {
          description: "sets the input's caret-color to orange",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
        },
        {
          description: "sets the input's caret-color back to transparent",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
        },
        {
          description: "throws an error for a non-existent element",
          success: "success",
          screenshotLink:
            "/opt/module/tests/wdio/__snapshots__/latest/fr/chrome_huge/validateElement-spec/full_implementation[default].png",
        },
      ],
    },
  },
};


const data = {
  suites: []
}

Object.values(jsondata).forEach((spec) => {
  const revSpecs = Object.values(spec)
  console.log('*** revSpecs', revSpecs)
  revSpecs.forEach((test) => {
    if(test.parent !== test.description) {
      const parentIndex = revSpecs.findIndex(item => item.description === test.parent)
      console.log('*** parentIndex', parentIndex)
      if(parentIndex > -1) {
        revSpecs[parentIndex].tests.push(test)
      }
    }
  })
  data.suites.push(revSpecs.shift())
})

console.log(JSON.stringify(data, null, 2))