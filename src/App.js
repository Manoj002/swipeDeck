import React from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';

export default class App extends React.Component {

  // Animated is capable of animating anything like opacity, height, etcetera...

  componentWillMount() {
    //this.animatedValue = new Animated.Value(1);  // for opacity

    this.animatedValue = new Animated.Value(100)
  }

  componentDidMount() {
    Animated.timing(this.animatedValue, {
      // toValue: .3,
      // duration: 1000,
      // easing: Easing.bounce   // all options are for opacity

      // Animation for height

      toValue: 150,
      duration: 1000,
      easing: Easing.bounce
    }).start()
  }

  // For more Animation : Easing react native.

  render() {

    //const animatedStyle = { opacity: this.animatedValue }

    const animatedStyle = { height: this.animatedValue }
    
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.viewStyle, animatedStyle]} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewStyle: {
    backgroundColor: '#333',
    height: 100,
    width: 100
  }
});
