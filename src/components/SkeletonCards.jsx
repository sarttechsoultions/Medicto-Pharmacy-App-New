import React from 'react';
import { View, ScrollView } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonCards = ( {
  width = 60, height = 60, borderRadius = 50,
  titleWidth = 120, titleHeight = 20,
  subtitleWidth = 80, subtitleHeight = 20,
  marginLeft = 20, marginTop = 6,
  speed = 1200, count = 1,
  // borderWidth = 1,
  list = false,
  horizontal = false,
  cardWidth = 160, cardHeight = 220,
  cardBorderRadius = 14, imageHeight = 130,

  grid = false,
  gridItemWidth = '30%',
  gridIconSize = 54,
  gridIconRadius = 16,
  gridLabelWidth = 60,
  gridLabelHeight = 12,
  gridColumns = 3,
} ) => {
  const cards = Array( count ).fill( null );

  if ( horizontal ) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingHorizontal: 16 }}
      >
        {cards.map( ( _, i ) => (
          <SkeletonPlaceholder key={i} speed={speed} borderRadius={cardBorderRadius}>
            <SkeletonPlaceholder.Item width={cardWidth} height={cardHeight} borderRadius={borderRadius}
              // borderWidth={borderWidth}
              overflow='hidden'>
              <SkeletonPlaceholder.Item width={cardWidth} height={imageHeight} borderRadius={0} />
              <SkeletonPlaceholder.Item marginTop={10} marginHorizontal={10} width={cardWidth - 40} height={14} borderRadius={4} />
              <SkeletonPlaceholder.Item marginTop={8} marginHorizontal={10} width={cardWidth - 70} height={12} borderRadius={4} />
              <SkeletonPlaceholder.Item marginTop={12} marginHorizontal={10} width={cardWidth - 20} height={32} borderRadius={12} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        ) )}
      </ScrollView>
    );
  }

  if ( grid ) {
    const rows = [];
    for ( let i = 0; i < cards.length; i += gridColumns ) {
      rows.push( cards.slice( i, i + gridColumns ) );
    }

    return (
      <View style={{ flexDirection: 'column', gap: 12 }}>
        {rows.map( ( row, rowIdx ) => (
          <View key={rowIdx} style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-start' }}>
            {row.map( ( _, colIdx ) => (
              <SkeletonPlaceholder key={colIdx} speed={speed} borderRadius={16}>
                <SkeletonPlaceholder.Item
                  width={gridItemWidth}
                  alignItems="center"
                  paddingVertical={10}
                  paddingHorizontal={8}
                  borderRadius={borderRadius}
                  // borderWidth={borderWidth}
                  overflow='hidden'
                >
                  <SkeletonPlaceholder.Item
                    width={gridIconSize}
                    height={gridIconSize}
                    borderRadius={gridIconRadius}
                  />
                  <SkeletonPlaceholder.Item
                    marginTop={8}
                    width={gridLabelWidth}
                    height={gridLabelHeight}
                    borderRadius={4}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            ) )}
          </View>
        ) )}
      </View>
    );
  }

  if ( list ) {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 14, gap: 12 }}>
        {cards.map( ( _, i ) => (
          <SkeletonPlaceholder key={i} speed={speed} borderRadius={16}>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              backgroundColor="#FFFFFF"
              padding={12}
              gap={12}
              borderRadius={borderRadius}
              // borderWidth={borderWidth}
              overflow='hidden'>
              {/* Image box */}
              <SkeletonPlaceholder.Item width={83} height={90} borderRadius={12} />

              {/* Text info */}
              <SkeletonPlaceholder.Item flex={1} gap={6}>
                <SkeletonPlaceholder.Item width={60} height={10} borderRadius={4} />
                <SkeletonPlaceholder.Item width={140} height={15} borderRadius={4} />
                <SkeletonPlaceholder.Item width={100} height={12} borderRadius={4} />
                <SkeletonPlaceholder.Item width={80} height={16} borderRadius={4} />
              </SkeletonPlaceholder.Item>

              {/* Add button */}
              <SkeletonPlaceholder.Item width={36} height={36} borderRadius={10} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        ) )}
      </View>
    );
  }

  return (
    <>
      {cards.map( ( _, i ) => (
        <SkeletonPlaceholder key={i} borderRadius={4} speed={speed}>
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={width} height={height} borderRadius={borderRadius} />
            <SkeletonPlaceholder.Item marginLeft={marginLeft}>
              <SkeletonPlaceholder.Item width={titleWidth} height={titleHeight} />
              <SkeletonPlaceholder.Item marginTop={marginTop} width={subtitleWidth} height={subtitleHeight} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      ) )}
    </>
  );
};

export default SkeletonCards;