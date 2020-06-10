import { cleanup, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import BitcoinInput, { BitcoinInputProps } from './index'

type inputVector = {
  actual: string
  expected: string
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function renderBitcoinInput(props: Partial<BitcoinInputProps> = {}) {
  const defaultProps: BitcoinInputProps = {
    onChange: jest.fn(),
    onCoinChange: jest.fn(),
  }
  return render(<BitcoinInput {...defaultProps} {...props} />)
}

function getInputs(
  dom: ReturnType<typeof renderBitcoinInput>
): [HTMLInputElement, HTMLElement] {
  const input = dom
    .getByTestId('bitcoin-input')
    .getElementsByTagName('input')[0]
  const select = dom.getByTestId('bitcoin-input-select-value')

  return [input, select]
}

async function switchCoin(
  dom: ReturnType<typeof renderBitcoinInput>,
  buttonType: 'bitcoin' | 'satoshi'
): Promise<void> {
  const selectButton = dom.getByRole('button')
  userEvent.click(selectButton)
  const options = await dom.findAllByRole('option')
  const bitcoinButton = options[0]
  userEvent.click(bitcoinButton)
  const satoshiButton = options[1]
  if (buttonType === 'bitcoin') userEvent.click(bitcoinButton)
  else userEvent.click(satoshiButton)
}

describe('BitcoinInput', () => {
  test('renders correctly', () => {
    // arrange
    const dom = renderBitcoinInput()
    const [bitcoinInput, coinSelect] = getInputs(dom)

    // assert
    expect(bitcoinInput).toBeDefined()
    expect(bitcoinInput).toHaveValue('')
    expect(coinSelect).toBeDefined()
    expect(coinSelect).toHaveValue('0')
  })

  test('coin change button behaves correclty', async () => {
    // arrange
    const mockOnCoinChange = jest.fn()
    const dom = renderBitcoinInput({ onCoinChange: mockOnCoinChange })
    const coinSelect = getInputs(dom)[1]

    // assert
    await switchCoin(dom, 'satoshi')
    expect(coinSelect).toHaveValue('1')
    expect(mockOnCoinChange).toHaveBeenCalledTimes(1)

    await switchCoin(dom, 'bitcoin')
    expect(coinSelect).toHaveValue('0')
    expect(mockOnCoinChange).toHaveBeenCalledTimes(2)
  })

  test('can switch back to and from satoshi', async () => {
    // arrange
    const validBitcoinInput: {
      actualBitcoin: string
      expectedSatoshi: string
      expectedBitcoin: string
    }[] = [
      {
        actualBitcoin: '12',
        expectedSatoshi: '1200000000',
        expectedBitcoin: '12',
      },
      {
        actualBitcoin: '47',
        expectedSatoshi: '4700000000',
        expectedBitcoin: '47',
      },
      {
        actualBitcoin: '15.',
        expectedSatoshi: '1500000000',
        expectedBitcoin: '15',
      },
      {
        actualBitcoin: '25.1234567',
        expectedSatoshi: '2512345670',
        expectedBitcoin: '25.1234567',
      },
      {
        actualBitcoin: '0.12389',
        expectedSatoshi: '12389000',
        expectedBitcoin: '0.12389',
      },
      {
        actualBitcoin: '0.000001',
        expectedSatoshi: '100',
        expectedBitcoin: '0.000001',
      },
    ]
    const dom = renderBitcoinInput()
    const input = getInputs(dom)[0]

    // act & assert
    for (const elem of validBitcoinInput) {
      fireEvent.change(input, { target: { value: elem.actualBitcoin } })
      await switchCoin(dom, 'satoshi')
      expect(input).toHaveValue(elem.expectedSatoshi)
      await switchCoin(dom, 'bitcoin')
      expect(input).toHaveValue(elem.expectedBitcoin)
    }
  })

  describe('bitcoin value', () => {
    describe('using invalid inputs', () => {
      const invalidBitcoinInput: inputVector[] = [
        {
          actual: 'abc',
          expected: '',
        },
        {
          actual: '1$',
          expected: '1',
        },
        {
          actual: '123456789',
          expected: '12345678',
        },
        {
          actual: '@@15.',
          expected: '15.',
        },
        {
          actual: '15.123456789',
          expected: '15.12345678',
        },
        {
          actual: '0..01',
          expected: '0.01',
        },
      ]
      test('cannot paste', () => {
        // arrange
        const dom = renderBitcoinInput()
        const input = getInputs(dom)[0]

        // act & assert
        for (const elem of invalidBitcoinInput) {
          userEvent.paste(input, elem.actual)
          expect(input).toHaveValue('')
        }
      })
      test('accepts only valid keys', async () => {
        for (const elem of invalidBitcoinInput) {
          // arrange
          const dom = renderBitcoinInput()
          const input = getInputs(dom)[0]
          // act
          userEvent.type(input, elem.actual)

          // assert
          expect(input).toHaveValue(elem.expected)

          // clean
          await cleanup()
        }
      })
    })

    describe('with valid input', () => {
      test('can enter valid input', () => {
        const validBitcoinInputs: inputVector[] = [
          {
            actual: '12',
            expected: '12',
          },
          {
            actual: '47',
            expected: '47',
          },
          {
            actual: '15.',
            expected: '15.',
          },
          {
            actual: '0.12389',
            expected: '0.12389',
          },
          {
            actual: '0000001.12345',
            expected: '1.12345',
          },
        ]

        const mockOnChange = jest.fn()
        const dom = renderBitcoinInput({
          onChange: mockOnChange,
        })
        const input = getInputs(dom)[0]

        // act & assert
        for (const elem of validBitcoinInputs) {
          fireEvent.change(input, { target: { value: elem.actual } })
          expect(input).toHaveValue(elem.expected)
        }
        expect(mockOnChange).toHaveBeenCalledTimes(validBitcoinInputs.length)
      })
    })
  })

  describe('satoshi value', () => {
    describe('using invalid inputs', () => {
      const invalidSatoshiInputs: inputVector[] = [
        {
          actual: 'abc',
          expected: '',
        },
        {
          actual: '1$',
          expected: '1',
        },
        {
          actual: '12345678123456789',
          expected: '1234567812345678',
        },
        {
          actual: '@@15.',
          expected: '15',
        },
        {
          actual: '15.123456789',
          expected: '15123456789',
        },
        {
          actual: '0.01',
          expected: '1',
        },
      ]
      test('cannot paste', () => {
        // arrange
        const dom = renderBitcoinInput({ isBitcoin: false })
        const input = getInputs(dom)[0]

        // act & assert
        for (const elem of invalidSatoshiInputs) {
          userEvent.paste(input, elem.actual)
          expect(input).toHaveValue('')
        }
      })
      test('accepts only valid keys', async () => {
        for (const elem of invalidSatoshiInputs) {
          // arrange
          const dom = renderBitcoinInput({ isBitcoin: false })
          const input = getInputs(dom)[0]
          // act
          userEvent.type(input, elem.actual)

          // assert
          expect(input).toHaveValue(elem.expected)

          // clean
          await cleanup()
        }
      })
    })

    describe('with valid input', () => {
      test('can enter valid input', () => {
        // arrange
        const validSatoshiInputs: inputVector[] = [
          {
            actual: '12',
            expected: '12',
          },
          {
            actual: '47',
            expected: '47',
          },
          {
            actual: '99999999',
            expected: '99999999',
          },
          {
            actual: '00000001',
            expected: '1',
          },
        ]

        const mockOnChange = jest.fn()
        const dom = renderBitcoinInput({
          onChange: mockOnChange,
          isBitcoin: false,
        })
        const input = getInputs(dom)[0]

        // act & assert
        for (const elem of validSatoshiInputs) {
          fireEvent.change(input, { target: { value: elem.actual } })
          expect(input).toHaveValue(elem.expected)
        }
        expect(mockOnChange).toHaveBeenCalledTimes(validSatoshiInputs.length)
      })
    })
  })
})
