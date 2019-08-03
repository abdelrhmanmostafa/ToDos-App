import React from 'react';

import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import App from './App'

configure({adapter: new Adapter()})

describe(' App Component ', () =>{

    it('should pass if contacts equas to filtered contacts', ()=>{
        const wrapper = shallow(<App />)
        expect(wrapper.state('contacts')).toEqual(wrapper.state('filteredContacts'))
    })
    
    it('should update filtered contacts',()=>{
        const wrapper = shallow(<App />)
        const instance = wrapper.instance()
        instance.handleSearch({target:{value: 'all'}});
        expect(wrapper.state('filteredContacts')).toEqual([{ id: 2, name: "Allan Samuel", discreption: "Content Writer", phoneNumber: "", image: require('./assets/canva-speech-bubble-chat-icon-MACD19Bt9IQ.png') }])
    })
})