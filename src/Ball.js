import React, { Component } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default class Ball extends React.Component {

    componentWillMount() {                                    // 3 Questions
        this.position = new Animated.ValueXY( 0 , 0 );        // 1. Where is the item right now? Animated.ValueXY...
        Animated.spring(this.position, {                      // 2. Where is the item moving to? Animated.Spring...
            toValue: { x: 200, y: 400}
        }).start();                                           // either statrt is right now or we can also give a span of time
    }                                                         // The whole code inside this method is passed to Animated.View through getLayout() method.

    // Comment for Animated.View
    // 3. Which item are we moving? Animated.View 
    //    this.position is passed as props to Animated.View
    render() {
        return(
            <Animated.View style={this.position.getLayout()}> 
                <View style={styles.containerStyle}/>
            </Animated.View>
        )
    }
}

const styles = StyleSheet.create({
    containerStyle: {
        height: 80,
        width: 80,
        borderRadius: 40,
        borderWidth: 40,
        borderColor: 'black'
    }
})