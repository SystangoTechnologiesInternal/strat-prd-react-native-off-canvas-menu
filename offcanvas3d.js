import React, { Component } from 'react'
import {
  Dimensions,
  Text,
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  BackAndroid,
  Platform,
  Image
} from 'react-native'
import PropTypes from 'prop-types';

class OffCanvas3D extends Component {
  constructor(props) {
    super(props)
    _this = this

    this._hardwareBackHandler = this._hardwareBackHandler.bind(this)

    this.state = {
      activityLeftPos : new Animated.Value(0),
      scaleSize : new Animated.Value(1.0),
      rotate: new Animated.Value(0),
      animationDuration: 400,
      stagArr: [],
      animatedStagArr: [],
      menuItems: this.props.menuItems,
      activeMenu: 0,
      bounceValue: new Animated.Value(0),
      isNewVisible : false,
    }
  }

  // staggered animation configuration for menu items
  componentDidMount() {
    let stagArrNew = []
    for (let i = 0; i < this.state.menuItems.length; i++) stagArrNew.push(i)
    this.setState({ stagArr: stagArrNew})

    let animatedStagArrNew = []
    stagArrNew.forEach((value) => {
      animatedStagArrNew[value] = new Animated.Value(0)
    })
    this.setState({ animatedStagArr: animatedStagArrNew })

    this.state.bounceValue.setValue(0);     // Start large


  }

  // any update to component will fire the animation
  componentDidUpdate() {
    this._animateStuffs()

    if(this.props.handleBackPress && this.props.active) {
      BackAndroid.addEventListener('hardwareBackPress', this._hardwareBackHandler)
    }

    if(this.props.handleBackPress && !this.props.active) {
      BackAndroid.removeEventListener('hardwareBackPress', this._hardwareBackHandler)
    }
  }

  render() {

    const rotateVal = this.state.rotate.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '0deg']
    })

    const staggeredAnimatedMenus = this.state.stagArr.map((index) => {
      return (
        <TouchableWithoutFeedback key={index} onPress={this._handlePress.bind(this, index)} style={{backgroundColor: 'red'}}>
          <Animated.View
          style={{ transform: [{ translateX: this.state.animatedStagArr[index] }] }}>
            <View style={styles.menuItemContainer}>
              {this.state.menuItems[index].icon}
              <Text style={[styles.menuItem, { ...this.props.menuTextStyles }]}>
                {this.state.menuItems[index].title}
              </Text>
              {this._handleNewIcon(index)}
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      )
    })

    return (
      <View style={[styles.offCanvasContainer, {
        flex: 1,
        backgroundColor: 'transparent'
      }]}>
      <Animated.View style={{position:'absolute', left:40, top:65, alignItems:'center', justifyContent:'center',  transform: [                        // `transform` is an ordered array
            {scale: this.state.bounceValue},  // Map `bounceValue` to `scale`
          ]}} >
          <View>
          {this.props.profileImageBG}
          <View  style={{position:'absolute', left:25, top:13.5, flex:1,alignSelf:'center',width:this.props.width_profile,height:this.props.height_profile,borderRadius:this.props.radious_profile}}>
          {this.props.profileImage}
          </View>
        </View>
        <Text style={{marginTop:1, fontSize:15, color:'white', fontWeight:'bold', height:20}}>{this.props.profileName}</Text>

      </Animated.View>
        <ScrollView
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        style={{
          position: 'absolute',
          top: 180,
          left: 0,
          right: 0,
          bottom: 0,
          flex:1,
          zIndex:100,
        }}>
          <Animated.View style={styles.menuItemsContainer}>
              {staggeredAnimatedMenus}
          </Animated.View>
        </ScrollView>

        <Animated.View
        style={[styles.activityContainer, {
          zIndex:200,
          flex: 1,
          backgroundColor: 'transparent',
          transform: [
            { translateX: this.state.activityLeftPos },
            { scale: this.state.scaleSize },
            { rotateY: rotateVal }
          ]
        }]}>
          {this.state.menuItems[this.state.activeMenu].renderScene(this.state.activeMenu)}
        </Animated.View>
      </View>
    )
  }
  
  _handleNewIcon(index){
    console.log('+++handle new')
    if(this.state.isNewVisible)
    { 
      if(this.state.menuItems[index].title == 'WHAT\'S NEW')
      {
      return(
        <View style ={{width:35,height:25,}}>
        <Image style={{position:'absolute',width:30,height:25,marginLeft:5,marginTop:0,}} source={require('./visuals/new.gif')} />
        </View>
      )
    }
  }

  }

  // press on any menu item, render the respective scene
  _handlePress(index) {
    if (index == 4) {
      this.props.parentObj.showLogoutAlert();
    } else {
      this.setState({ activeMenu: index })
      this.props.onMenuPress()
    }
  }

  _hardwareBackHandler() {
    this.props.onMenuPress()
    return true
  }

  // control swipe left or right reveal for menu
  _gestureControl(evt) {
    const {locationX, pageX} = evt.nativeEvent

    if (!this.props.active) {
    //  if (locationX < 40 && pageX > 100) this.props.onMenuPress()
    } else {
      //if (pageX) this.props.onMenuPress()
    }
  }

  // animate stuffs with hard coded values for fine tuning
  _animateStuffs() {

    if (!this.props.active) {
      if (Platform.OS === "ios") {
          this.state.bounceValue.setValue(0);
      } else {
        setTimeout (() => {
          this.state.bounceValue.setValue(0);     // Start large
        }, 500);
      }

    }

    const activityLeftPos = this.props.active ? 180 : 0
    const scaleSize = this.props.active ? .75 : 1
    const rotate = this.props.active ? 1 : 0
    const menuTranslateX = this.props.active? 0 : -250

    Animated.parallel([
      Animated.timing(this.state.activityLeftPos, { toValue: activityLeftPos, duration: this.state.animationDuration }),
      Animated.timing(this.state.scaleSize, { toValue: scaleSize, duration: this.state.animationDuration }),
      Animated.timing(this.state.rotate, { toValue: rotate, duration: this.state.animationDuration }),
      Animated.stagger(50, this.state.stagArr.map((item) => {
        if (this.props.active) {
          return Animated.timing(
            this.state.animatedStagArr[item],
            {
              toValue: menuTranslateX,
              duration: this.state.animationDuration,
              delay: 250
            }
          )
        } else {
          return Animated.timing(
            this.state.animatedStagArr[item],
            {
              toValue: menuTranslateX,
              duration: 1,
              delay: 0
            }
          )
        }
      }))
    ])
    .start();

    if (this.props.active) {

      setTimeout (() => {

        Animated.spring(                          // Base: spring, decay, timing
          this.state.bounceValue,                 // Animate `bounceValue`
          {
            toValue: 1,                         // Animate to smaller size
            friction: 3,                          // Bouncier spring
          }
        ).start();

      }, 500);
    }


  }
}

// validate props
OffCanvas3D.propTypes = {
  active: PropTypes.bool.isRequired,
  onMenuPress: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
  backgroundColor: PropTypes.string,
  menuTextStyles: PropTypes.object,
  handleBackPress: PropTypes.bool
}

// set default props
OffCanvas3D.defaultProps = {
  backgroundColor: '#222222',
  menuTextStyles: { color: 'white' },
  handleBackPress: true
}

export default OffCanvas3D

// structure stylesheet
const styles = StyleSheet.create({
  offCanvasContainer: {
    flex:1,
    flexDirection:'column'
  },
  menuItemsContainer: {
    paddingTop: 10
  },
  menuItemContainer: {
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuItem: {
    fontWeight: 'bold',
    paddingLeft: 12,
    paddingTop: 15,
    paddingBottom: 15
  },
  activityContainer: {

  }
})
