import React from 'react';
import { SpeakerCategory, SPEAKER_CATEGORIES } from "../../../model/Speakers";

interface Props {
  currentSpeakerCategory: SpeakerCategory,
  changeSpeakerCategoryCallback: (speakerCategorySlug: string) => void,
}

interface State {
}

class CategoryDropdown extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  changeCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let slug = event.target.value;
    this.props.changeSpeakerCategoryCallback(slug);
  }

  public render() {
    let options : any[] = [];

    SPEAKER_CATEGORIES.forEach(category => {
      const slug = category.getSlug();
      let selected = undefined;

      if (this.props.currentSpeakerCategory.getSlug() === slug) {
        selected = true;
      }

      const option = <option 
        key={slug} 
        value={slug} 
        selected={selected}>{category.getName()}</option>;

      options.push(option);
    });

    return (
      <div className="columns is-gapless">
        <div className="column is-full">
          <div className="control is-expanded">
            <div className="select is-fullwidth">
              <select onChange={this.changeCategory}>
                {options.map(option => option)}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export { CategoryDropdown };
