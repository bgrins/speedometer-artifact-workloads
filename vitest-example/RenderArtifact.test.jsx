import { expect, expectTypeOf, test } from 'vitest'
// import { render } from 'vitest-browser-react'
import { render } from '@testing-library/react';


import ArtifactMissingTests from '../src/artifacts/data-dashboard-1'
test('renders artifact', async () => {
  const foo = render(<ArtifactMissingTests />);
  expect(window.TESTS).toBe([
    
  ]);
  // expect(window.TESTS).toBe([
  //     {
  //       "name": "ExpandAllModules",
        
  //     },
  //     {
  //       "name": "CollapseAllModules",
        
  //     },
  //     {
  //       "name": "SwitchAllCoursesAndViews",
        
  //     },
  //     {
  //       "name": "SearchAndFilter",
        
  //     },

  // ]);
  // await expect.element(getByText('Hello Vitest!')).toBeInTheDocument()
})


import Artifact from '../src/artifacts/edu-2'


test('renders artifact', async () => {
  // const foo = render(<Artifact />)
  // expectTypeOf(window.TESTS).toEqualTypeOf(Array);
  // window.tests = [];
})
