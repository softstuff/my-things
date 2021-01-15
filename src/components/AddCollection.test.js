import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
import AddCollection from './AddCollection';

describe('Adding a new collection', ()=>{
    fit('verify regression', ()=>{
        const component = renderer.create(
            <AddCollection />,
          );
          let tree = component.toJSON();
          expect(tree).toMatchSnapshot();

    })

    // fit('should have correct label', ()=>{
    //     render(<AddCollection />)
    //     const label = screen.getByRole('label')
    //     console.log(label)
    //     expect(label).toContain('New collection')
    // })
})