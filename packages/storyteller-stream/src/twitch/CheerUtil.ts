
const CHEER_REGEX = /^([A-Za-z]+)(\d+)?$/;

interface ParsedCheer {
  cheerPrefix?: string,
  bitValue?: number,
}

export class CheerUtil {

  public static parseCheerString(cheerString: string) : ParsedCheer {
    const matches = cheerString.trim().match(CHEER_REGEX)

    let cheerPrefix = undefined;
    let bitValue = undefined;

    if (!!matches && matches.length > 1) {
      cheerPrefix = matches[1];
      if (matches.length === 3 && matches[2] !== undefined) {
        // NB(1): The second match group can be 'undefined' if no number is present. (Optional matching.)
        let maybeBits = parseInt(matches[2]);
        if (!isNaN(maybeBits) && maybeBits > 0) {
          bitValue = maybeBits;
        }
      }
    }

    return {
      cheerPrefix: cheerPrefix,
      bitValue: bitValue,
    };
  }

  public static joinCheerAndPrefix(cheerPrefix?: string, bitValue?: number) : string {
    return `${cheerPrefix || ''}${bitValue || ''}`;
  }
}