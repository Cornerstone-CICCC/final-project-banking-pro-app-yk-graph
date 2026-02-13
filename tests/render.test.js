jest.mock('readline', () => ({
  createInterface: jest.fn(() => ({
    question: jest.fn(),
    close: jest.fn(),
  })),
}))

const { renderHeader, renderMenu } = require('../src/index.js')

describe('render functions', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  test('renderHeader should log 3 lines for the header', () => {
    renderHeader()
    expect(console.log).toHaveBeenCalledTimes(3)
  })

  test('renderMenu should log 9 lines for the menu', () => {
    renderMenu()
    expect(console.log).toHaveBeenCalledTimes(9)
  })
})
