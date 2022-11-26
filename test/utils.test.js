/*
  Imports
*/

import { assert } from 'chai'

import { getFlagChecker } from '../src/utils/index.ts'

/*
  Test values
*/

const flags = ['-f', '--flag']

/*
  Assertions
*/

describe('getFlagChecker', () => {

  const checkFlag = getFlagChecker(flags)

  it('returns a function (\'checkFlag\')', () => {
    assert.isFunction(checkFlag)
  })

  describe('checkFlag', () => {

    it('returns true if the array passed contains one or more flags', () => {
      assert.equal(checkFlag(['-f']), true)
      assert.equal(checkFlag(['--flag']), true)
      assert.equal(checkFlag(['-f', '--flag']), true)
      assert.equal(checkFlag(['-n', '-f']), true)
      assert.equal(checkFlag(['-n', '-f', '--nonflag', '--flag']), true)
    })

    it('returns false if the array passed contains no flags', () => {
      assert.equal(checkFlag([]), false)
      assert.equal(checkFlag(['-n']), false)
      assert.equal(checkFlag(['-n', '--nonflag']), false)
    })
  })
})
