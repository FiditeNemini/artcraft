import React from 'react';
import { Speaker, SPEAKERS, SpeakerCategory, SPEAKERS_BY_CATEGORY } from "../../../model/Speakers";

interface Props {
  currentSpeaker: Speaker,
  currentSpeakerCategory: SpeakerCategory,
  changeSpeakerCallback: (speakerSlug: string) => void,
}

interface State {
}

class SpeakerDropdown extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  changeSpeaker = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let slug = event.target.value;
    this.props.changeSpeakerCallback(slug);
  }

  public render() {
    if (this.props.currentSpeakerCategory.getSlug() === 'all') {
      return this.renderAllByQuality();
    } else {
      return this.renderSortedCategory();
    }
  }

  protected renderAllByQuality() {
    let bestSpeakerOptions : any[] = [];
    let goodSpeakerOptions : any[] = [];
    let badSpeakerOptions : any[] = [];
    let terribleSpeakerOptions : any[] = [];

    let speakersForCategory = SPEAKERS_BY_CATEGORY.get(this.props.currentSpeakerCategory) || [];

    speakersForCategory.forEach(speaker => {
      const quality = speaker.getVoiceQuality();
      const slug = speaker.getSlug();
      let selected = undefined;
      if (this.props.currentSpeaker.slug === speaker.slug) {
        selected = true;
      }
      const option = <option 
        key={slug} 
        value={speaker.getSlug()} 
        selected={selected}>{speaker.getName()}</option>;

      if (quality >= 7.5) {
        bestSpeakerOptions.push(option);
      } else if (quality >= 5.9) {
        goodSpeakerOptions.push(option);
      } else if (quality >= 4.5) {
        badSpeakerOptions.push(option);
      } else {
        terribleSpeakerOptions.push(option);
      }
    });

    return (
      <div className="column is-two-thirds">
        <div className="control is-expanded">
          <div className="select is-fullwidth">
            <select onChange={this.changeSpeaker}>
              <optgroup label="&mdash; Highest Quality Voices &mdash;">
                {bestSpeakerOptions.map(option => {
                  return option;
                })}
              </optgroup>
              <optgroup label="&mdash; Decent Quality Voices &mdash;">
                {goodSpeakerOptions.map(option => {
                  return option;
                })}
              </optgroup>
              <optgroup label="&mdash; Poor Quality Voices (need cleanup) &mdash;">
                {badSpeakerOptions.map(option => {
                  return option;
                })}
              </optgroup>
              <optgroup label="&mdash; Terrible Quality Voices (need rework) &mdash;">
                {terribleSpeakerOptions.map(option => {
                  return option;
                })}
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    );
  }

  protected renderSortedCategory() {
    let speakerOptions: any[] = [];

    let speakersForCategory = SPEAKERS_BY_CATEGORY.get(this.props.currentSpeakerCategory) || [];

    speakersForCategory = [...speakersForCategory];

    speakersForCategory.sort((s1, s2) => {
      let name1 = s1.getName().toLowerCase();
      let name2 = s2.getName().toLowerCase();
      if (name1 < name2) {
        return -1;
      } else if (name1 > name2) {
        return 1;
      } else {
        return 0;
      }
    });

    speakersForCategory.forEach(speaker => {
      const slug = speaker.getSlug();
      let selected = undefined;
      if (this.props.currentSpeaker.slug === speaker.slug) {
        selected = true;
      }
      const option = <option 
        key={slug} 
        value={speaker.getSlug()} 
        selected={selected}>{speaker.getName()}</option>;

      speakerOptions.push(option);
    });

    return (
      <div className="column is-two-thirds">
        <div className="control is-expanded">
          <div className="select is-fullwidth">
            <select onChange={this.changeSpeaker}>
              {speakerOptions.map(option => {
                return option;
              })}
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export { SpeakerDropdown };