import React, { Component } from 'react';
import { View,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions,
    UIManager,
    LayoutAnimation
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
// .width & .height gives width & height of device 
// Dimensions gives dimensions of device

const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

const SWIPE_OUT_DIRECTION = 100;

class Deck extends Component {

    static defaultProps = {    
        // when the parent component does not send some props or it is not available
        // We can create a defaultProps in the child component and use as we want.
        onSwipeRight: () => {},
        onSwipeLeft: () => {}
    }

    constructor(props) {
        super(props);

        const position = new Animated.ValueXY(); 
        // Value of Position is changing as user drags on screen every moment.
        // We need to reset the value since every new card displayed will always be displayed at 
        // previous card's position(i.e. out of screen)
        
        const panResponder = PanResponder.create({
            // Every callback method is called with 2 arguments event & gesture

            // PanResponders life cycle methods...
            // Will be called at different span of life of PanResponder

            onStartShouldSetPanResponder: () => true,   
            // is called whenever user presses on screen or taps on screen
            // if onStartShouldSetPanResponder returns true, 
            // it states that this instance(panResponder) should be responsible for handling user touch inputs
            //                              OR
            // if onStartShouldSetPanResponder returns false,
            // it states that, user touch is getting noticed but this instance(panResponder) will not handle it
            // this is callback method because we can also sometimes evaluate things and set it to true or false.

            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy })
            },
            // is called when a user has tapped or pressed on screen and 
            // is now dragging his/her finger on screen

            // event : it holds informatin about what element got pressed by user 
            // gesture : it holds information about the event occured like what the user is doing on screen

            // the gesture object that is in memory(RAM) is been reused every time user drags on screen and 
            // gets changed and also resets to 0 again as user takes finger away from screen

            // has Property fields as dx and dy which we need to operate.
            // dx and dy informs how much users finger has moved on a component

            onPanResponderRelease: (event, gesture) => {
                if(gesture.dx > SWIPE_THRESHOLD) {
                    this.forceSwipe('right');
                } 
                else if(gesture.dx < -SWIPE_THRESHOLD){
                    this.forceSwipe('left');
                }
                else {
                    this.resetPosition();  // resetting card back to its initial position with animation SWING
                }
            }
            // is called when a user has tapped or pressed on screen and 
            // may have dragged his/her finger on screen and 
            // has now taken his finger away from screen(i.e releases the screen)
        });
        
        this.state = { panResponder, position, index : 0 }; //official Docs way for panResponder and position
    
        // this.panResponder = panResponder;                //can also be done this way 
    }

    componentDidMount() {   // required only for android
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    componentWillUpdate() {  // required only for android
        LayoutAnimation.spring();
    }

    componentWillReceiveProps(nextProps) {  

        // it will be executed when component is going to receive again some props
        // here we can compare the existing props with the incoming props
        // the next set props are passed to this function as argument as nextProps

        if(nextProps.data !== this.props.data) {

            // in js comparision is done by checking the incoming data and existing data in memory are they exact
            // rather than checking each internal elements

            // will prefectly wwell when used with redux backend or store

            this.setState({ index: 0 });
        }
    }

    forceSwipe(direction) {
        const x = direction === 'right' ? 2 *SCREEN_WIDTH : -SCREEN_WIDTH * 2;

        Animated.timing(this.state.position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DIRECTION
        }).start(() => {
            this.onSwipeCompleted(direction);
            // this.prepNextCard()...?? the current Animated.View is designed to render and handle only 1 card
            // if we created this.prepNextCard(), 
            // it will again reset the card and keep on transitioning/animating(card is moving out of screen) the next card.
            // Rather there is much more conventional way to do it, we will call a call back method in .start() 
        });
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: { x: 0, y: 0}
        }).start();
    }

    onSwipeCompleted(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;

        const item = data[this.state.index]

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        // an index must be passed with both of these methods 
        // to recognize which card has beed swiped

        this.state.position.setValue({ x: 0, y: 0 })  
        // not recommended, as it is clearly mutating the state of position and is against conventions
        // recommended way is to define position out of state as a normal local variable in constructor

        this.setState({ index: this.state.index+ 1})
        // we are not mutating index rather updating it so it is fine to work with it
    }

    getCardStyle() {
        const { position } = this.state;
        const rotate = position.x.interpolate({                  // position comes from Animated.ValueXY and 
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH ],// interpolate method is used to bind two properties
            outputRange: ['-90deg', '0deg', '90deg']
        })
        return {
            ...this.state.position.getLayout(),   // returns a list of object
            transform: [{ rotate }]               // used for rotation
        }
    }

    renderCards() {

        if(this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCards();
        }

        return this.props.data.map(( item, i ) => {  // i(referred as index and is optional) here is argument given from map  
            
            if( i < this.state.index ) { return null; }
            
            if( i === this.state.index ) {
                return(
                    <Animated.View
                        key={ item.id }
                        style={[this.getCardStyle(), styles.cardStyle, {zIndex: 0}] }   
                        // can provide an array of styles
                        // bug with android
                        // react-native-elements/SwipeDeck android bug #17 &
                        // solution is object with zIndex = 0
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
            return (          
                // originally to be returned: this.props.renderCard(item)
                // but to provide a style to item we should wrap it with a view with style
                <Animated.View 
                    style={[styles.cardStyle, {zIndex: 0}, { top: 10 * (i - this.state.index) }]}  
                    // bug with android
                    // react-native-elements/SwipeDeck android bug #17 &
                    // solution is object with zIndex = 0

                    // top: is a style which takes the component and places it to given pixel above
                    // and the expression is total logic 
                    key={item.id}
                >
                    {this.props.renderCard(item)}
                </Animated.View>
            );
        }).reverse();
    }

// while providing styles to main card that is going to be rendered, theres a bug in android 
// in ios it works fine, but in android we have to provide a object too. with zIndex with value of 0

    render() {
        return(
            <View>
                {this.renderCards()}
            </View>
        )
    }
} 

// As our render method has a view and it call renderCards() and renderCards() has Animated.View,
// this is bug in ios while works fine in android

const styles = StyleSheet.create({
    cardStyle: {               // render cards at absolute position
        position: 'absolute',  // position absolute means positioning the component at top of screen
        width: SCREEN_WIDTH  
    //    left: 0,      // try with these both as styles...
    //    right: 0  
    }
})

// The panHandlers have a bunch of different callbacks and, 
// all those callbacks are provided to the root component with the help of ... operator

export default Deck;