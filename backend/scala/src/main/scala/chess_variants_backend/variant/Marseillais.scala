package chess_variants_backend.variant

import chess.variant.{Variant, Standard}

case class Marseillais
  extends Variant(
    id = Variant.Id(6),
    key = Variant.LilaKey("marseillais"),
    uciKey = Variant.UciKey("marseillais"),
    name = "Marseillais Chess",
    shortName = "Marseillais",
    title = "Each player in turn makes two consecutive moves.",
    standardInitialPosition = true
  ):
  
  def pieces = Standard.pieces
