package main

import (
	"context"
	"fmt"

	"github.com/Grow-Simplee-KGP/Thoth/proto"
)

type binpack struct {
	proto.UnimplementedTransportServer
}

func (b *binpack) RunBinPacking(context context.Context, breq *proto.BinPackingRequest) (*proto.BinPackingResponse, error) {
	fmt.Print(breq)
	req := []*proto.Box{{Id: 1, Length: 1, Breadth: 1, Height: 1}}
	pos := []*proto.Position{{X: 1, Y: 1, Z: 1}}
	return &proto.BinPackingResponse{Items: req, Positions: pos}, nil
}

func (b *binpack) RunCVRP(context context.Context, cvrpreq *proto.CVRPRequest) (*proto.CVRPResponse, error) {

	return &proto.CVRPResponse{}, nil
}
